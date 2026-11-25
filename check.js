// Run with: node check.js
// Checks story.js structure and simulates playthroughs using the same rules as the game (rules.js).
const Rules = require('./rules.js');
const STORY = require('./story.js');
Rules.pickQuestions(STORY);

let failures = 0;
function check(ok, msg) {
  console.log((ok ? 'PASS  ' : 'FAIL  ') + msg);
  if (!ok) failures++;
}

const scenes = Rules.allScenes(STORY); // every possible scene, for the structure checks
const choiceScenes = scenes.filter(s => !s.type || s.type === 'choice');

// ---------- Structure ----------
const ids = scenes.map(s => s.id);
check(new Set(ids).size === ids.length, 'scene ids are unique');
check(scenes[scenes.length - 1].type === 'ending', 'story ends with an ending scene');
const badPools = STORY.sceneList.filter(e => e.pool).filter(e => {
  const sig = sc => JSON.stringify(sc.choices.map(c => [c.stress || 0, c.prep || 0, c.mindset || 0, c.kind || '', !!c.auto]).sort());
  return e.pool.some(v => v.act !== e.pool[0].act || sig(v) !== sig(e.pool[0]));
}).map(e => e.pool[0].id);
check(badPools.length === 0, 'every pool variant has the same act and the same choice numbers as the others' + (badPools.length ? ' (' + badPools.join(', ') + ')' : ''));
const chancePrep = STORY.sceneList.filter(e => e.chance != null && e.choices && e.choices.some(c => c.prep));
check(chancePrep.length === 0, 'random (chance) events give no prep, so prep on offer stays 7');
check(scenes.filter(s => s.question).every(s => STORY.questions[s.question]), 'every exam scene points to an existing question');
const badBrain = [];
choiceScenes.concat([STORY.freeze]).forEach(s => s.choices.forEach(c => { if (c.brain && !STORY.brain[c.brain]) badBrain.push(s.id + ': ' + c.brain); }));
check(badBrain.length === 0, 'every choice brain region exists' + (badBrain.length ? ' (' + badBrain.join(', ') + ')' : ''));
const badCount = choiceScenes.concat([Object.assign({ id: 'freeze' }, STORY.freeze)])
  .filter(s => s.choices.length !== 4 || s.choices.filter(c => c.auto).length !== 1).map(s => s.id);
check(badCount.length === 0, 'every choice scene (and the freeze set) has exactly 4 choices and exactly one auto' + (badCount.length ? ' (' + badCount.join(', ') + ')' : ''));
Rules.buildRun(STORY, () => 0.99); // skips chance events; any pool variant works since their numbers match
const prepOnOffer = STORY.scenes.filter(s => !s.type || s.type === 'choice').reduce((sum, s) => sum + Math.max(0, ...s.choices.map(c => c.prep || 0)), 0);
check(prepOnOffer === 7, 'total prep on offer is 7 (got ' + prepOnOffer + ')');
check(STORY.freeze.choices.every(c => (c.stress || 0) < 0), 'every freeze option lowers stress, so the freeze loop always ends');
check(Object.keys(STORY.questions).length === 4, 'exam has 4 question slots');
const allQs = [].concat.apply([], Object.values(STORY.questionPool));
check(allQs.every(q => q.text && q.note && q.options.length === 4 && q.answer >= 0 && q.answer < 4), 'every pooled question has text, a note, 4 options and a valid answer (' + allQs.length + ' questions)');

// ---------- Simulation ----------
let rangeOk = true, freezeOk = true;
function inRange(s) { if (!(s.stress >= 0 && s.stress <= 100)) rangeOk = false; }

function build() { Rules.pickQuestions(STORY); Rules.buildRun(STORY); }
function play(pick) {
  const scenes = STORY.scenes;
  const s = Rules.newState();
  const visited = [];
  let i = Rules.advance(STORY, -1, s);
  while (i < scenes.length) {
    const scene = scenes[i];
    visited.push(scene.id);
    if (scene.type === 'ending') break;
    if (!scene.type || scene.type === 'choice') {
      let loops = 0;
      while (Rules.frozen(scene, s)) {
        Rules.applyChoice(s, pick(s, STORY.freeze.choices));
        inRange(s);
        if (++loops > 100) { freezeOk = false; break; }
      }
      const c = pick(s, scene.choices);
      Rules.applyChoice(s, c);
      inRange(s);
      // Simulated player answers every question with the right option; the rules give marks
      // only for covered, unblocked ones, i.e. the same as "covered+unblocked right, others wrong".
      if (scene.question) Rules.afterCoping(scene, c, s).forEach(q => Rules.answer(STORY, s, q, STORY.questions[q].answer));
    }
    i = Rules.advance(STORY, i, s);
    inRange(s);
  }
  const end = Rules.ending(s);
  return { state: s, visited, end: end.key, avg: end.avg, grade: Rules.grade(s), prep: Rules.examPrep(s) };
}

const byLowestStress = (s, cs) => cs.reduce((b, c) => Rules.stressDelta(s, c) < Rules.stressDelta(s, b) ? c : b);
function prepGain(s, c) { return Math.min(4, Math.max(0, s.prep + (c.prep || 0))) - s.prep; }
function smartScore(s, c) { return Math.abs(s.stress + Rules.stressDelta(s, c) - 50) - 10 * prepGain(s, c); }

const strategies = {
  auto: (s, cs) => cs.find(c => c.auto),
  calming: byLowestStress,
  effortful: (s, cs) => cs.reduce((b, c) => {
    const pc = c.prep || 0, pb = b.prep || 0;
    return pc > pb || (pc === pb && (c.stress || 0) > (b.stress || 0)) ? c : b;
  }),
  disengage: (s, cs) => cs.find(c => c.kind === 'disengage') || byLowestStress(s, cs),
  // Regulates but never disengages: a calm option when there is one, else the lowest-stress non-disengage option.
  calmOnly: (s, cs) => byLowestStress(s, cs.filter(c => c.kind === 'calm').length ? cs.filter(c => c.kind === 'calm') : cs.filter(c => c.kind !== 'disengage')),
  smart: (s, cs) => cs.reduce((b, c) => smartScore(s, c) < smartScore(s, b) ? c : b)
};

const RUNS = 10000;
const counts = { window: 0, overwhelmed: 0, checkedOut: 0 };
const seen = new Set();
let gradeSum = 0;
for (let r = 0; r < RUNS; r++) {
  build();
  const res = play((s, cs) => cs[Math.floor(Math.random() * cs.length)]);
  counts[res.end]++;
  gradeSum += res.grade;
  res.visited.forEach(id => seen.add(id));
}
console.log('\nRandom (' + RUNS + ' runs): ' + Object.keys(counts).map(k => k + ' ' + (100 * counts[k] / RUNS).toFixed(1) + '%').join(', ') + ', mean grade ' + (gradeSum / RUNS).toFixed(2));
Object.keys(counts).forEach(k => check(counts[k] / RUNS >= 0.05, 'random: ending "' + k + '" occurs in at least 5% of runs'));
const unreached = ids.filter(id => !seen.has(id));
check(unreached.length === 0, 'every scene is reachable' + (unreached.length ? ' (never reached: ' + unreached.join(', ') + ')' : ''));

console.log('');
// Each strategy plays the same 300 randomly built runs; every goal must hold in every run.
const BUILDS = 300, all = {};
Object.keys(strategies).forEach(k => { all[k] = []; });
for (let b = 0; b < BUILDS; b++) {
  build();
  Object.keys(strategies).forEach(k => all[k].push(play(strategies[k])));
}
Object.keys(strategies).forEach(k => {
  const rs = all[k], ends = {};
  rs.forEach(r => { ends[r.end] = (ends[r.end] || 0) + 1; });
  console.log(k.padEnd(10) + ' endings ' + JSON.stringify(ends).padEnd(40) + ' grade ' + Math.min(...rs.map(r => r.grade)) + '-' + Math.max(...rs.map(r => r.grade)) + '/4');
});
const every = f => all.smart.every((_, b) => f(b));
check(all.auto.every(r => r.end === 'overwhelmed'), 'always auto ends overwhelmed');
check(every(b => all.calming[b].grade <= all.smart[b].grade), 'always most calming does not beat smart');
check(every(b => all.effortful[b].grade <= all.smart[b].grade), 'always most effortful does not beat smart');
check(all.disengage.every(r => r.end === 'checkedOut'), 'always disengage ends checked out');
check(all.calmOnly.every(r => r.end !== 'checkedOut'), 'calm-only (regulating, never disengaging) does not end checked out');
check(every(b => all.calmOnly[b].grade <= all.smart[b].grade), 'calm-only does not beat smart');
check(all.smart.every(r => r.end === 'window'), 'smart ends in the window');
check(every(b => ['auto', 'calming', 'effortful', 'disengage'].every(k => all.smart[b].grade > all[k][b].grade)), 'smart beats every fixed strategy on grade');
check(rangeOk, 'stress stays within 0-100 in every simulated run');
check(freezeOk, 'the freeze loop always ends');

// No single option is best in every situation: the smart pick must change with stress.
const fixedBest = choiceScenes.filter(sc => {
  const picks = [20, 50, 80].map(st => { const s = Rules.newState(); s.stress = st; return strategies.smart(s, sc.choices).label; });
  return picks.every(p => p === picks[0]);
}).map(s => s.id);
check(fixedBest.length === 0, 'no scene has one option that is best at stress 20, 50 and 80' + (fixedBest.length ? ' (' + fixedBest.join(', ') + ')' : ''));

console.log('\n' + (failures ? failures + ' check(s) FAILED' : 'All checks passed'));
process.exitCode = failures ? 1 : 0;

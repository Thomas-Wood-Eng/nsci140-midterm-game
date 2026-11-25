// Game rules. The ONLY place stress/mindset/prep/timer/exam/ending maths lives.
// Loaded by index.html (browser) and require()d by check.js (Node), so both always agree.
var Rules = (function () {
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function newState() {
    return { stress: 35, mindset: 0, prep: 0, felt: 0, flags: {}, examStress: [], marks: {}, skipped: null, history: [] };
  }

  // Zones: below 30 checked out, 30-70 the window, above 70 overwhelmed, 90+ freeze.
  function zone(s) { return s >= 90 ? 'freeze' : s > 70 ? 'overwhelmed' : s < 30 ? 'checkedOut' : 'window'; }
  var ZONE_LABEL = { checkedOut: 'Checked out', window: 'In the window', overwhelmed: 'Overwhelmed', freeze: 'Frozen' };
  function distFromWindow(s) { return s < 30 ? 30 - s : s > 70 ? s - 70 : 0; }

  // Stress change a choice would cause from the current state (mindset multiplier, calm halving).
  function stressDelta(state, c) {
    var d = c.stress || 0;
    if (d > 0) d *= 1 - 0.15 * state.mindset;
    else if (d < 0 && c.kind === 'calm' && state.stress < 40) d /= 2; // disengage and untagged apply in full
    var next = state.stress + d;
    // Regulating brings you into the window, never below it: calm decreases stop at 30.
    if (d < 0 && c.kind === 'calm') next = Math.max(next, Math.min(state.stress, 30));
    return clamp(next, 0, 100) - state.stress;
  }

  // Applies a choice. Stress uses the mindset from before the choice. Returns the question
  // numbers whose study notes were just earned (prep N covers questions 1..N).
  function applyChoice(state, c) {
    var before = state.stress, prepBefore = state.prep;
    state.stress = before + stressDelta(state, c);
    state.mindset = clamp(state.mindset + (c.mindset || 0), -3, 3);
    state.prep = clamp(state.prep + (c.prep || 0), 0, 4);
    state.felt += c.felt || 0;
    if (c.set) state.flags[c.set] = true;
    state.history.push({ label: c.label, before: before, after: state.stress });
    var earned = [];
    for (var n = prepBefore + 1; n <= state.prep; n++) earned.push(n);
    return earned;
  }

  // Between acts only: stress moves toward 45 by a share of the gap.
  function drift(state) {
    var before = state.stress;
    state.stress = clamp(before + (45 - before) * (0.5 + 0.1 * state.mindset), 0, 100);
    state.history.push({ label: 'Time passes', before: before, after: state.stress, drift: true });
  }

  function visible(scene, state) {
    if (!scene.if) return true;
    return typeof scene.if === 'function' ? !!scene.if(state) : !!state.flags[scene.if];
  }

  // Index of the next scene to show after scene i (story order, skipping gated bonus scenes).
  // Applies the between-act drift when the act changes.
  function advance(story, i, state) {
    var sc = story.scenes, j = i + 1;
    while (j < sc.length && !visible(sc[j], state)) j++;
    if (i >= 0 && j < sc.length && sc[j].act !== sc[i].act) drift(state);
    return j;
  }

  // Timers: base seconds scaled by stress (stress 100 -> 75%, stress 0 -> 125%).
  function scaleTime(base, stress) { return base * (1 - (stress - 50) / 200); }
  function decisionTime(act, stress) { return scaleTime(act === 1 ? 20 : act === 2 ? 15 : 10, stress); }
  // Base time grows with reading length: 4 s to think plus ~3.5 words a second, never under 10 s.
  function questionTime(stress, q) {
    var words = q ? (q.text + ' ' + q.options.join(' ')).split(/\s+/).length : 0;
    return scaleTime(Math.max(10, 4 + words / 3.5), stress);
  }

  // Exam. Only exam scenes (the ones with a question) can freeze.
  function frozen(scene, state) { return !!scene.question && state.stress >= 90; }
  function examPrep(state) { return Math.max(0, state.prep - (state.flags.allNighter ? 1 : 0)); }
  function qNumber(story, id) { return Object.keys(story.questions).indexOf(id) + 1; }
  function covered(story, state, id) { return qNumber(story, id) <= examPrep(state); }
  function blocked(story, state, id) { return covered(story, state, id) && state.stress > 70; }

  // Call after the coping choice of an exam scene: records stress for the ending and
  // returns the question ids to show now (handles skip and go-back).
  function afterCoping(scene, choice, state) {
    var qs = [];
    state.examStress.push(state.stress);
    if (choice.skip) state.skipped = scene.question;
    else qs.push(scene.question);
    if (choice.reopen && state.skipped && state.stress < 70) { qs.push(state.skipped); state.skipped = null; }
    return qs;
  }

  // pick: option index, or -1 for a timeout (blank). Marks only for covered, unblocked, correct.
  function answer(story, state, id, pick) {
    state.marks[id] = pick === story.questions[id].answer && covered(story, state, id) && !blocked(story, state, id);
    return state.marks[id];
  }
  function grade(state) {
    var g = 0;
    for (var k in state.marks) if (state.marks[k]) g++;
    return g;
  }

  // Ending by average exam stress (scenes 12-15, after each coping choice) plus prep at exam time.
  function ending(state) {
    var sum = 0;
    state.examStress.forEach(function (s) { sum += s; });
    var avg = state.examStress.length ? sum / state.examStress.length : state.stress;
    return { key: avg > 70 ? 'overwhelmed' : avg < 30 ? 'checkedOut' : 'window', prep: examPrep(state) >= 3 ? 'high' : 'low', avg: avg };
  }

  // Picks one question per slot for this run (story.questions keeps slot order q1..q4).
  function pickQuestions(story, rand) {
    rand = rand || Math.random;
    Object.keys(story.questionPool).forEach(function (k) {
      var pool = story.questionPool[k];
      story.questions[k] = pool[Math.floor(rand() * pool.length)];
    });
  }

  // Builds this run's scene list: picks one variant from each pool and rolls each chance event once.
  function buildRun(story, rand) {
    rand = rand || Math.random;
    story.scenes = [];
    story.sceneList.forEach(function (e) {
      if (e.pool) story.scenes.push(e.pool[Math.floor(rand() * e.pool.length)]);
      else if (e.chance == null || rand() < e.chance) story.scenes.push(e);
    });
  }
  // Every scene that could ever appear (pool variants and chance events included).
  function allScenes(story) {
    return [].concat.apply([], story.sceneList.map(function (e) { return e.pool || [e]; }));
  }

  return {
    buildRun: buildRun, allScenes: allScenes,
    pickQuestions: pickQuestions,
    newState: newState, zone: zone, ZONE_LABEL: ZONE_LABEL, distFromWindow: distFromWindow,
    stressDelta: stressDelta, applyChoice: applyChoice, drift: drift, visible: visible, advance: advance,
    decisionTime: decisionTime, questionTime: questionTime, frozen: frozen, examPrep: examPrep,
    qNumber: qNumber, covered: covered, blocked: blocked, afterCoping: afterCoping, answer: answer,
    grade: grade, ending: ending
  };
})();
if (typeof module !== 'undefined') module.exports = Rules;

// Engine: scene flow, timers, exam, freeze, rendering, mood effects, ending chart, audio, accessibility.
// Game rules (all the maths) live in rules.js; all content and numbers live in story.js.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var S = null;             // game state (see Rules.newState)
  var curScene = null;
  var qlog = {};            // question id -> outcome text for the grade screen
  var keyHandler = null;    // current 1-9 key handler
  var skipReveal = null;    // finishes the current text reveal early
  var lastRegion = 'amygdala';
  var opts = { relaxed: false, noFx: window.matchMedia('(prefers-reduced-motion: reduce)').matches, sound: true }; // heartbeat on by default; audio starts on the Play click (browsers need a click first)

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rich(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>'); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function announce(t) {
    var el = $('announce');
    el.textContent = '';
    setTimeout(function () { el.textContent = t; }, 50);
  }
  function zoneText(s) { return Rules.ZONE_LABEL[Rules.zone(s)]; }
  function show(id) { ['start', 'game', 'ending'].forEach(function (s) { $(s).hidden = s !== id; }); document.body.classList.toggle('on-menu', id === 'start'); }

  // ---------------- Art (all drawn in code) ----------------
  function room(wall, floor, sky, light) {
    return '<rect width="400" height="220" fill="' + wall + '"/><rect y="172" width="400" height="48" fill="' + floor + '"/>' +
      '<rect x="40" y="22" width="110" height="78" fill="' + sky + '" stroke="#f8f8f8" stroke-width="6"/>' + light +
      '<rect x="20" y="140" width="220" height="10" fill="#7a4f33"/><rect x="30" y="150" width="8" height="40" fill="#7a4f33"/><rect x="222" y="150" width="8" height="40" fill="#7a4f33"/>';
  }
  var BACKGROUNDS = {
    bedroomDay: function () { return room('#f4ead6', '#c9a77c', '#a9d8f5', '<circle cx="124" cy="46" r="12" fill="#ffd45c"/>'); },
    bedroomNight: function () { return room('#323a5c', '#4a3d36', '#0d1430', '<circle cx="124" cy="44" r="10" fill="#f0f0d0"/><circle cx="215" cy="120" r="34" fill="#ffd98a" opacity=".25"/><rect x="208" y="110" width="14" height="30" fill="#ddd"/>'); },
    library: function () {
      var s = '<rect width="400" height="220" fill="#e9e1cf"/><rect y="172" width="400" height="48" fill="#a98b6b"/>', cols = ['#9b3d3d', '#3d6b9b', '#4f8a4f', '#c49a3a', '#6b4f8a'];
      for (var r = 0; r < 3; r++) {
        s += '<rect x="10" y="' + (44 + r * 40) + '" width="380" height="5" fill="#6b4a2f"/>';
        for (var b = 0; b < 30; b++) s += '<rect x="' + (12 + b * 12.6) + '" y="' + (18 + r * 40) + '" width="10" height="26" fill="' + cols[(b * 7 + r) % 5] + '"/>';
      }
      return s + '<rect x="20" y="140" width="230" height="10" fill="#7a4f33"/><rect x="30" y="150" width="8" height="40" fill="#7a4f33"/><rect x="232" y="150" width="8" height="40" fill="#7a4f33"/>';
    },
    walk: function () {
      var s = '<rect width="400" height="220" fill="#cfe8f5"/><circle cx="360" cy="30" r="14" fill="#ffd45c"/><rect y="150" width="400" height="70" fill="#9ccc8a"/><rect y="182" width="400" height="22" fill="#8b8f96"/>';
      [40, 170, 380].forEach(function (x) { s += '<rect x="' + (x - 4) + '" y="110" width="8" height="45" fill="#6b4a2f"/><circle cx="' + x + '" cy="100" r="26" fill="#5e9e57"/>'; });
      return s;
    },
    hallway: function () {
      var s = '<rect width="400" height="220" fill="#dcd6c8"/><rect y="172" width="400" height="48" fill="#b5ab99"/>';
      for (var x = 10; x < 210; x += 32) s += '<rect x="' + x + '" y="60" width="28" height="112" fill="#7d9bb5" stroke="#5d7b95"/><rect x="' + (x + 20) + '" y="110" width="3" height="12" fill="#333"/>';
      return s + '<rect x="330" y="60" width="60" height="112" fill="#8a6a4a"/><rect x="335" y="36" width="50" height="16" fill="#fff" stroke="#333"/><text x="360" y="48" font-size="10" text-anchor="middle" font-family="sans-serif">EXAM</text>';
    },
    examhall: function () {
      var s = '<rect width="400" height="220" fill="#e4e0d6"/><rect y="120" width="400" height="100" fill="#c8bfae"/><circle cx="200" cy="40" r="18" fill="#fff" stroke="#333" stroke-width="2"/><path d="M200 40V28M200 40h9" stroke="#333" stroke-width="2"/>';
      for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) s += '<rect x="' + (14 + c * 64) + '" y="' + (100 + r * 30) + '" width="44" height="8" fill="#8a6a4a"/>';
      return s + '<rect x="20" y="150" width="220" height="10" fill="#7a4f33"/>';
    },
    bathroom: function () {
      var s = '<rect width="400" height="220" fill="#dfeef0"/>';
      for (var x = 0; x < 400; x += 25) s += '<path d="M' + x + ' 0V220" stroke="#c4dadd"/>';
      for (var y = 0; y < 220; y += 25) s += '<path d="M0 ' + y + 'H400" stroke="#c4dadd"/>';
      return s + '<rect x="40" y="20" width="120" height="90" fill="#bfd9e6" stroke="#888" stroke-width="4"/><rect x="30" y="135" width="140" height="18" rx="8" fill="#fff" stroke="#999"/><rect x="95" y="120" width="8" height="16" fill="#999"/>';
    }
  };

  function propSvg(name) {
    var p = {
      notification: '<rect x="40" y="40" width="190" height="58" rx="10" fill="#fff" stroke="#333"/><rect x="50" y="53" width="32" height="32" rx="6" fill="#3b6fb6"/><text x="92" y="66" font-size="12" font-weight="700">Course portal</text><text x="92" y="85" font-size="12">Midterm in 7 days</text>',
      phone: '<rect x="100" y="48" width="66" height="92" rx="9" fill="#222"/><rect x="105" y="56" width="56" height="74" fill="#fff"/><rect x="109" y="62" width="36" height="12" rx="5" fill="#d9d9e8"/><rect x="121" y="80" width="36" height="12" rx="5" fill="#9fd6c9"/><rect x="109" y="98" width="30" height="12" rx="5" fill="#d9d9e8"/>',
      exam: '<rect x="70" y="58" width="130" height="86" fill="#fff" stroke="#333"/><text x="80" y="76" font-size="11" font-weight="700">NSCI 140 MIDTERM</text><path d="M80 90h110M80 104h110M80 118h80M80 132h100" stroke="#999"/>',
      notecard: '<rect x="70" y="62" width="130" height="78" fill="#fff6b0" stroke="#b9a640" transform="rotate(-4 135 100)"/><text x="82" y="82" font-size="11" font-weight="700">Study notes</text><path d="M82 96h100M82 110h100M82 124h70" stroke="#b9a640"/>',
      quizcard: '<rect x="70" y="50" width="130" height="90" fill="#fff" stroke="#333"/><text x="80" y="68" font-size="11" font-weight="700">Practice quiz</text><rect x="80" y="80" width="10" height="10" fill="none" stroke="#333"/><rect x="80" y="98" width="10" height="10" fill="none" stroke="#333"/><rect x="80" y="116" width="10" height="10" fill="none" stroke="#333"/><path d="M96 86h80M96 104h80M96 122h60" stroke="#999"/>',
      grade: '<rect x="60" y="44" width="150" height="96" rx="6" fill="#fff" stroke="#333" stroke-width="3"/><text x="135" y="72" font-size="13" text-anchor="middle">Midterm grade</text><text x="135" y="115" font-size="34" font-weight="700" text-anchor="middle">' + Rules.grade(S) + '/4</text>',
      thought: '<circle cx="268" cy="58" r="4" fill="#fff" stroke="#555"/><circle cx="256" cy="44" r="7" fill="#fff" stroke="#555"/><ellipse cx="214" cy="28" rx="40" ry="20" fill="#fff" stroke="#555"/><text x="214" y="34" font-size="16" text-anchor="middle">?!</text>'
    }[name];
    return p ? '<g class="prop" font-family="sans-serif">' + p + '</g>' : '';
  }

  // Character silhouettes: 7 poses. Arms are polylines from the shoulders.
  var POSES = {
    neutral: { arms: ['M287 96L280 130L282 156', 'M313 96L320 130L318 156'] },
    focused: { head: [0, 3], arms: ['M287 96L268 124L250 128', 'M313 96L300 120L296 100'] },
    anxious: { arms: ['M287 96L292 126L318 118', 'M313 96L308 128L282 120'], extra: '<path d="M326 58q4 8 0 10q-4-2 0-10z" fill="#6ab0e0"/>' },
    panicked: { arms: ['M287 96L266 82L286 60', 'M313 96L334 82L314 60'], extra: '<path d="M262 50l-10-6M262 64l-12 0M338 50l10-6M338 64l12 0" stroke="#c0392b" stroke-width="3"/>' },
    frozen: { color: '#55687a', arms: ['M287 96L283 152', 'M313 96L317 152'], extra: '<text x="330" y="52" font-size="20" fill="#55687a" font-family="sans-serif">...</text>' },
    exhausted: { head: [-4, 12], arms: ['M287 100L282 134L284 162', 'M313 100L318 134L316 162'], extra: '<text x="322" y="58" font-size="16" fill="#555" font-family="sans-serif">z z</text>' },
    relieved: { arms: ['M287 96L266 70L262 46', 'M313 96L334 70L338 46'] }
  };
  function figure(pose) {
    var p = POSES[pose] || POSES.neutral, c = p.color || '#2b2b3a', h = p.head || [0, 0];
    return '<g class="figure">' +
      '<path d="M294 160L290 206M306 160L310 206" stroke="' + c + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M285 92Q300 86 315 92L310 164H290Z" fill="' + c + '"/>' +
      p.arms.map(function (d) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'; }).join('') +
      '<circle cx="' + (300 + h[0]) + '" cy="' + (70 + h[1]) + '" r="16" fill="' + c + '"/>' + (p.extra || '') + '</g>';
  }
  function autoPose(s) {
    var z = Rules.zone(s);
    return z === 'checkedOut' ? 'neutral' : z === 'window' ? (s < 60 ? 'focused' : 'anxious') : z === 'overwhelmed' ? 'panicked' : 'frozen';
  }
  function drawArt(bg, prop, pose) {
    $('art').innerHTML = '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">' + (BACKGROUNDS[bg] || BACKGROUNDS.bedroomDay)() + propSvg(prop) + figure(pose) + '</svg>';
  }

  // ---------------- Brain panel ----------------
  // Hotspots over the NIDA brain illustration (art/brain.js), in its own units (front of the brain is on the left).
  var REGIONS = {
    pfc: '<ellipse cx="11" cy="22" rx="7.5" ry="9"/>',
    hypothalamus: '<circle cx="27" cy="37.5" r="2.6"/>',
    amygdala: '<circle cx="30.5" cy="40" r="2.6"/>',
    hippocampus: '<ellipse cx="37" cy="40.5" rx="4.2" ry="2.2" transform="rotate(-20 37 40.5)"/>'
  };
  function buildBrain() {
    $('brain').innerHTML = BRAIN_SVG;
    var svg = $('brain').querySelector('svg');
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('viewBox', '0 0 67.73 57'); // crop to the brain, dropping most of the spinal cord
    svg.setAttribute('aria-label', 'Brain panel. Tap a region for an explanation.');
    var layers = svg.querySelectorAll(':scope > g');
    if (layers[2]) layers[2].style.display = 'none'; // layer 4 holds the image's own text labels
    var hs = '';
    Object.keys(REGIONS).forEach(function (r) {
      hs += '<g id="br-' + r + '" class="region region-' + r + '" tabindex="0" role="button">' + REGIONS[r] + '</g>';
    });
    svg.insertAdjacentHTML('beforeend', hs);
    Object.keys(REGIONS).forEach(function (r) {
      var g = $('br-' + r);
      g.addEventListener('click', function () { showRegion(r); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showRegion(r); } });
    });
  }
  function brainLevels(s) {
    return {
      amygdala: s / 100,
      hypothalamus: s / 100,
      pfc: 1 - Math.abs(s - 50) / 50,
      hippocampus: s > 70 ? 0.15 : 0.4 + 0.15 * S.prep
    };
  }
  function showRegion(r) {
    var b = STORY.brain[r];
    lastRegion = r;
    $('brainInfo').hidden = false;
    $('brainBtn').setAttribute('aria-expanded', 'true');
    $('brainInfo').innerHTML = '<strong>' + esc(b.name) + '</strong><br>' + b.text.split('\n').map(esc).join('<br>') + '<br><small>Source: ' + esc(b.source) + '</small>';
  }
  function flash(r) {
    var g = $('br-' + r);
    if (!g) return;
    lastRegion = r;
    g.classList.add('flash');
    setTimeout(function () { g.classList.remove('flash'); }, 2500);
  }

  // ---------------- Rendering & mood ----------------
  function render() {
    var s = S.stress, z = Rules.zone(s), root = document.documentElement.style;
    document.body.className = 'zone-' + z + (opts.noFx ? ' nofx' : '') + (s > 80 ? ' shake' : '') + ($('start').hidden ? '' : ' on-menu');
    root.setProperty('--vig', Math.max(0, (s - 45) / 55).toFixed(2));
    root.setProperty('--blur', (s > 70 ? (s - 70) / 30 * 1.2 : 0).toFixed(2) + 'px');
    root.setProperty('--sceneblur', (s / 100 * 1.6).toFixed(2) + 'px');
    root.setProperty('--beat', (60 / (60 + s * 0.8)).toFixed(2) + 's');
    $('boat').setAttribute('transform', 'translate(' + Math.min(390, Math.max(10, s * 4)) + ' 0)');
    $('stressLabel').textContent = 'Stress ' + Math.round(s) + ': ' + zoneText(s);
    $('river').setAttribute('aria-label', 'Stress meter: ' + Math.round(s) + ' out of 100, ' + zoneText(s));
    var lv = brainLevels(s);
    Object.keys(lv).forEach(function (r) {
      var g = $('br-' + r), v = Math.max(0, Math.min(1, lv[r]));
      g.style.opacity = (0.2 + 0.8 * v).toFixed(2);
      g.setAttribute('aria-label', STORY.brain[r].name + ', activity ' + (v > 0.66 ? 'high' : v > 0.33 ? 'medium' : 'low'));
    });
    $('brainStatus').innerHTML = brainStatus(s).map(function (l) { return '<li><span class="dot region-' + l[0] + '"></span><strong>' + esc(STORY.brain[l[0]].name) + ':</strong> ' + esc(l[1]) + '</li>'; }).join('');
    if (curScene) drawArt(curScene.bg, curScene.prop, curScene.pose || autoPose(s));
  }
  // One plain-language line per region for the current stress (matches the zones).
  function brainStatus(s) {
    return [
      ['amygdala', s > 70 ? 'sounding the alarm' : s >= 30 ? 'alert' : 'quiet'],
      ['hypothalamus', s > 70 ? 'flooding you with cortisol' : s >= 30 ? 'stress response on' : 'resting'],
      ['pfc', s > 70 ? 'struggling to focus' : s >= 30 ? 'focused' : 'under-engaged'],
      ['hippocampus', s > 70 ? 'recall blocked' : 'recall working']
    ];
  }

  // ---------------- Text, choices, timers ----------------
  function say(text, cls) {
    var el = $('sceneText'), plain = text.replace(/\*\*/g, '');
    el.className = cls || '';
    announce(plain);
    if (opts.noFx) { el.innerHTML = rich(text); return Promise.resolve(); }
    return new Promise(function (resolve) {
      var i = 0, t;
      function finish() { clearInterval(t); skipReveal = null; el.innerHTML = rich(text); el.removeAttribute('aria-hidden'); resolve(); }
      el.setAttribute('aria-hidden', 'true'); // the live region reads the full text once
      el.textContent = '';
      t = setInterval(function () { i += 2; if (i >= plain.length) finish(); else el.textContent = plain.slice(0, i); }, 30);
      skipReveal = finish;
    });
  }

  // Shows buttons in the given order; resolves with the picked index, or -1 on timeout.
  // `disabled` indexes are shown greyed out and cannot be picked.
  function ask(labels, seconds, disabled, tags) {
    disabled = disabled || [];
    var box = $('choices');
    box.innerHTML = '';
    return new Promise(function (resolve) {
      var raf = null;
      function done(i) {
        if (raf) cancelAnimationFrame(raf);
        keyHandler = null;
        $('timer').hidden = true;
        box.innerHTML = '';
        resolve(i);
      }
      labels.forEach(function (l, i) {
        var b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = '<span class="key" aria-hidden="true">' + (i + 1) + '</span>' + esc(l) + (tags && tags[i] ? ' <em>' + esc(tags[i]) + '</em>' : '');
        b.setAttribute('aria-keyshortcuts', String(i + 1));
        if (disabled.indexOf(i) >= 0) b.setAttribute('aria-disabled', 'true');
        b.addEventListener('click', function () { if (disabled.indexOf(i) < 0) done(i); });
        box.appendChild(b);
      });
      if (!document.activeElement || document.activeElement === document.body) box.focus({ preventScroll: true });
      if (box.lastElementChild) box.lastElementChild.scrollIntoView({ block: 'nearest' }); // keep every choice on screen
      keyHandler = function (n) { if (n >= 1 && n <= labels.length && disabled.indexOf(n - 1) < 0) done(n - 1); };
      if (!seconds || opts.relaxed) return;
      var start = performance.now(), ms = seconds * 1000, ring = $('ringFg'), secs = $('timerSecs');
      $('timer').hidden = false;
      (function tick(now) {
        var left = Math.max(0, ms - (now - start));
        ring.style.strokeDashoffset = (113 * (1 - left / ms)).toFixed(1);
        secs.textContent = Math.ceil(left / 1000);
        if (left <= 0) done(-1); else raf = requestAnimationFrame(tick);
      })(start);
    });
  }

  function setCards(html) { $('cards').innerHTML = html; }
  function showCards(html) {
    setCards(html);
    announce($('cards').textContent);
    return ask(['Continue']).then(function () { setCards(''); });
  }
  function noteCard(n) {
    var q = STORY.questions[Object.keys(STORY.questions)[n - 1]];
    return '<div class="card note"><strong>Study note ' + n + '</strong><p>' + rich(q.note) + '</p></div>';
  }

  // ---------------- Scene types ----------------
  async function decide(sc, act, text) {
    await say(text || sc.text);
    var order = shuffle(sc.choices.slice());
    var i = await ask(order.map(function (c) { return c.label; }), Rules.decisionTime(act, S.stress));
    var c = i < 0 ? order.filter(function (o) { return o.auto; })[0] : order[i];
    var before = S.stress, earned = Rules.applyChoice(S, c), d = Math.round(S.stress - before);
    render();
    if (c.brain) flash(c.brain);
    await showCards(
      (i < 0 ? '<p class="amyg">You didn\'t decide. Your amygdala did.</p>' : '') +
      '<div class="card why"><strong>What just happened</strong><p>' + esc(c.why) + '</p>' +
      (c.brain ? '<p class="brainline"><strong>' + esc(STORY.brain[c.brain].name) + ':</strong> ' + esc(STORY.brain[c.brain].text.split('\n')[0]) + '</p>' : '') +
      '<p class="delta">Stress ' + (d > 0 ? '+' + d : d) + ', now ' + Math.round(S.stress) + ' (' + zoneText(S.stress) + ')</p></div>' +
      earned.map(noteCard).join(''));
    return c;
  }

  async function runChoice(sc) {
    if (sc.prop === 'grade') setCards('<div class="card"><strong>Your exam</strong><ul>' + Object.keys(STORY.questions).map(function (id, k) {
      return '<li>Question ' + (k + 1) + ': ' + esc(qlog[id] || 'left blank') + '</li>';
    }).join('') + '</ul></div>');
    while (Rules.frozen(sc, S)) await decide(STORY.freeze, sc.act);
    var text = sc.prop === 'grade' ? sc.text + ' You got ' + Rules.grade(S) + '/4.' : sc.text;
    var c = await decide(sc, sc.act, text);
    if (!sc.question) return;
    var qs = Rules.afterCoping(sc, c, S);
    for (var k = 0; k < qs.length; k++) await runQuestion(qs[k]);
  }

  async function runQuestion(id) {
    var q = STORY.questions[id], n = Rules.qNumber(STORY, id);
    var cov = Rules.covered(STORY, S, id), blk = Rules.blocked(STORY, S, id);
    setCards((cov ? '' : '<p class="mark">You don\'t recognise this.</p>') +
      (blk ? '<p class="mark">Stress is above 70: the answer is on the tip of your tongue, but you can\'t reach it.</p>' : ''));
    await say('Question ' + n + ': ' + q.text, curScene.blur ? 'blurscene' : '');
    var tags = q.options.map(function (o, k) { return blk && k === q.answer ? '(can\'t reach it)' : ''; });
    var i = await ask(q.options, Rules.questionTime(S.stress, q), blk ? [q.answer] : [], tags);
    var got = Rules.answer(STORY, S, id, i);
    qlog[id] = i < 0 ? 'left blank (time ran out)' : !cov ? 'not recognised, no marks' : got ? 'correct' : blk ? 'blocked by stress' : 'wrong';
    setCards('');
    if (i < 0) await showCards('<p class="mark">Time\'s up. You left it blank.</p>');
  }

  async function runQuiz(sc) {
    await say(sc.text);
    setCards('<p>How confident are you? 1 = not at all, 5 = completely.</p>');
    var conf = (await ask(['1', '2', '3', '4', '5'])) + 1, score = 0, ids = Object.keys(STORY.questions);
    setCards('');
    // All 4 topics are tested; only ones your notes cover count, the same rule as the exam.
    for (var n = 1; n <= ids.length; n++) {
      var q = STORY.questions[ids[n - 1]], known = n <= S.prep;
      setCards(known ? '' : '<p class="mark">Not in your notes yet. You do not recognise this.</p>');
      await say('Practice ' + n + ': ' + q.text);
      if ((await ask(q.options)) === q.answer && known) score++;
      setCards('');
    }
    var gap = conf / 5 - score / 4;
    await showCards('<div class="card"><strong>Confidence</strong> ' + conf + '/5 &middot; <strong>Felt ready</strong> +' + S.felt +
      ' (from rereading and rewatching) &middot; <strong>Practice score</strong> ' + score + '/4 exam topics</div>' +
      '<div class="card why"><strong>What just happened</strong><p>' +
      (gap > 0.25 ? 'You felt more ready than you were.' : gap < -0.25 ? 'You knew more than you thought.' : 'Your sense of readiness matched your score.') +
      ' ' + esc(sc.why) + '</p></div>');
  }

  async function runCutscene(sc) {
    await say(sc.text, sc.swim ? 'swim' : '');
    await showCards('<div class="card why"><strong>What just happened</strong><p>' + esc(sc.why) + '</p></div>');
  }

  async function play() {
    S = Rules.newState();
    Rules.pickQuestions(STORY);
    Rules.buildRun(STORY);
    qlog = {};
    show('game');
    var i = Rules.advance(STORY, -1, S);
    while (i < STORY.scenes.length) {
      var sc = curScene = STORY.scenes[i];
      $('actTitle').textContent = STORY.acts[sc.act] || '';
      render();
      if (sc.type === 'ending') return showEnding();
      if (sc.type === 'quiz') await runQuiz(sc);
      else if (sc.type === 'cutscene') await runCutscene(sc);
      else await runChoice(sc);
      $('sceneText').className = '';
      var n = S.history.length;
      i = Rules.advance(STORY, i, S);
      var dr = S.history.length > n && S.history[S.history.length - 1];
      if (dr && dr.drift) { // show the between-act settling so the meter never jumps unexplained
        render();
        await showCards('<p class="card">Time passes. Your stress settles from ' + Math.round(dr.before) + ' to ' + Math.round(dr.after) + '.</p>');
      }
    }
  }

  // ---------------- Ending ----------------
  function routeChart() {
    var h = S.history, pts = [h.length ? h[0].before : S.stress].concat(h.map(function (e) { return e.after; }));
    var x = function (k) { return 40 + k * (520 / Math.max(1, pts.length - 1)); }, y = function (s) { return 15 + (100 - s) * 2; };
    var s = '<svg viewBox="0 0 600 230" class="chart" role="group" aria-label="Your route down the river: stress over the game">' +
      '<rect x="40" y="' + y(100) + '" width="540" height="' + (y(70) - y(100)) + '" class="band-over"/>' +
      '<rect x="40" y="' + y(70) + '" width="540" height="' + (y(30) - y(70)) + '" class="band-window"/>' +
      '<rect x="40" y="' + y(30) + '" width="540" height="' + (y(0) - y(30)) + '" class="band-out"/>' +
      '<path d="M40 ' + y(90) + 'H580" class="freezeline"/>' +
      '<polyline points="' + pts.map(function (p, k) { return x(k).toFixed(1) + ',' + y(p).toFixed(1); }).join(' ') + '" class="route"/>' +
      '<path transform="translate(' + x(pts.length - 1) + ' ' + y(pts[pts.length - 1]) + ')" d="M-10 0h20l-4 6h-12zM0 0v-18l10 14z" class="boat"/>';
    var top = h.map(function (e, k) { return { e: e, k: k }; }).filter(function (o) { return !o.e.drift; })
      .sort(function (a, b) { return Math.abs(b.e.after - b.e.before) - Math.abs(a.e.after - a.e.before); }).slice(0, 3);
    top.forEach(function (o, m) {
      var e = o.e, d0 = Rules.distFromWindow(e.before), d1 = Rules.distFromWindow(e.after), d = Math.round(e.after - e.before);
      var dir = d1 < d0 ? 'toward the window' : d1 > d0 ? 'away from the window' : d0 === 0 ? 'and stayed in the window' : 'without changing your distance from the window';
      var desc = 'You picked ' + (e.label.charAt(0) === '"' ? e.label : '"' + e.label + '"') + ' while ' + zoneText(e.before).toLowerCase() + '. Stress ' + (d > 0 ? '+' + d : d) + ', ' + dir + '.';
      s += '<g class="marker" tabindex="0" role="button" aria-label="Moment ' + (m + 1) + ': ' + esc(desc) + '" data-desc="' + esc(desc) + '">' +
        '<circle cx="' + x(o.k + 1) + '" cy="' + y(e.after) + '" r="10"/><text x="' + x(o.k + 1) + '" y="' + (y(e.after) + 4) + '" text-anchor="middle">' + (m + 1) + '</text></g>';
    });
    return s + '</svg>';
  }

  function epilogueRiver(mindset) {
    var half = Math.max(4, 18 + 6 * mindset);
    return '<svg viewBox="0 0 600 90" class="chart" aria-hidden="true"><rect width="600" height="90" class="band-out"/>' +
      '<rect x="0" y="' + (45 - half) + '" width="600" height="' + (half * 2) + '" class="band-window"/>' +
      '<path d="M0 27H600M0 63H600" class="oldbank"/><path transform="translate(300 48)" d="M-10 0h20l-4 6h-12zM0 0v-18l10 14z" class="boat"/></svg>';
  }

  function showEnding() {
    var e = Rules.ending(S), E = STORY.endings[e.key], m = S.mindset;
    var epi = m > 0 ? STORY.epilogue.wider : m < 0 ? STORY.epilogue.narrower : STORY.epilogue.same;
    show('ending');
    $('ending').innerHTML =
      '<div id="endArt" class="art" aria-hidden="true"></div>' +
      '<h1 tabindex="-1">' + esc(E.title) + '</h1>' +
      '<p class="lead">' + esc(E.text) + ' ' + esc(E[e.prep]) + '</p>' +
      '<p>Grade: ' + Rules.grade(S) + '/4. Average stress during the exam: ' + Math.round(e.avg) + ' (' + esc(E.title) + ').</p>' +
      '<h2>Your route</h2>' + routeChart() +
      '<p class="legend"><span class="li"><span class="sw band-over"></span>Top: overwhelmed (above 70; dashed line = freeze at 90)</span> <span class="li"><span class="sw band-window"></span>Middle: the river, your window of tolerance (30 to 70)</span> <span class="li"><span class="sw band-out"></span>Bottom: checked out (below 30)</span></p>' +
      '<p id="markerInfo" class="card" aria-live="polite">Tap or focus a numbered marker to see the three choices that moved your stress the most.</p>' +
      '<div class="card"><strong>Your brain</strong><p>' + esc(STORY.endingBrain) + '</p></div>' +
      '<div class="card note"><strong>Takeaways</strong><ul>' + STORY.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<h2>Epilogue: Next exam</h2>' + epilogueRiver(m) +
      '<p>' + esc(epi) + ' <small>(Dashed lines: where your banks started.)</small></p>' +
      '<p class="endbtns"><button id="replay" class="big">Try a different path</button> ' +
      '<a href="' + esc(STORY.wellnessUrl) + '" target="_blank" rel="noopener">UBC student wellness resources</a></p>';
    $('endArt').innerHTML = '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">' + BACKGROUNDS.walk() +
      figure(e.key === 'window' ? 'relieved' : e.key === 'overwhelmed' ? 'exhausted' : 'neutral') + '</svg>';
    Array.prototype.forEach.call(document.querySelectorAll('.marker'), function (g) {
      function info() { $('markerInfo').textContent = g.getAttribute('data-desc'); }
      g.addEventListener('click', info);
      g.addEventListener('focus', info);
    });
    $('replay').addEventListener('click', function () { curScene = null; show('start'); $('startBtn').focus(); });
    document.querySelector('#ending h1').focus();
    announce(E.title + '. ' + E.text + ' ' + E[e.prep]);
  }

  // ---------------- Heartbeat audio (Web Audio, muted by default) ----------------
  var actx = null, beatTimer = null;
  function beat() {
    // Only beat while a scene is on screen: silent on the menu and the ending/epilogue.
    if ($('game').hidden) { beatTimer = setTimeout(beat, 500); return; }
    var s = S ? S.stress : 35;
    [0, 0.18].forEach(function (off, k) {
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + off;
      o.frequency.value = k ? 50 : 65;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(k ? 0.4 : 0.7, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + 0.2);
    });
    beatTimer = setTimeout(beat, 60000 / (60 + s * 0.8));
  }
  function setSound(on) {
    opts.sound = on;
    $('soundBtn').setAttribute('aria-pressed', String(on));
    $('soundBtn').textContent = on ? 'Heartbeat sound: on' : 'Heartbeat sound: off';
    if (on) {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      actx.resume();
      if (!beatTimer) beat();
    } else { clearTimeout(beatTimer); beatTimer = null; }
  }

  // ---------------- Init ----------------
  function init() {
    buildBrain();
    $('intro').textContent = STORY.intro;
    $('fxToggle').checked = opts.noFx;
    $('fxToggle').addEventListener('change', function () {
      opts.noFx = this.checked;
      document.body.classList.toggle('nofx', opts.noFx);
    });
    document.body.classList.toggle('nofx', opts.noFx);
    $('soundBtn').addEventListener('click', function () { setSound(!opts.sound); });
    $('brainBtn').addEventListener('click', function () {
      if ($('brainInfo').hidden) showRegion(lastRegion);
      else { $('brainInfo').hidden = true; this.setAttribute('aria-expanded', 'false'); }
    });
    $('sceneText').addEventListener('click', function () { if (skipReveal) skipReveal(); });
    $('startBtn').addEventListener('click', function () {
      opts.relaxed = $('relaxedToggle').checked;
      if (opts.sound) setSound(true);
      play();
    });
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var n = parseInt(e.key, 10);
      if (skipReveal && (n >= 1 || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipReveal(); return; }
      if (n >= 1 && n <= 9 && keyHandler) { e.preventDefault(); keyHandler(n); }
    });
  }
  init();
})();

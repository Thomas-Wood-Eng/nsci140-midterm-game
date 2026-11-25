// All game content. Teammates edit ONLY this file.
// Scenes play in the order listed. A scene with `if` is a bonus scene shown only when its
// condition holds (a flag name, or a function of the game state).
// Choice fields: label, stress, mindset, prep, felt, set (flag name), kind ('calm' | 'disengage'),
// auto (the timeout default; exactly one per scene), why (the "what just happened" card),
// brain (region to highlight), skip / reopen (exam question 2 skip and go-back).
// Text in **double stars** is highlighted.
var STORY = {
  // TODO team: placeholder intro.
  intro: 'You are a first-year student. Your first big midterm is a week away. Your choices change how stressed you get, and stress changes what you can remember.',
  acts: { 1: 'Act 1: Study week', 2: 'Act 2: Night before', 3: 'Act 3: Exam day', 4: 'Act 4: After' },

  // Exam questions. Each run picks ONE question per slot at random (q1 to q4).
  // Prep N covers slots 1..N in this order. The study note for a slot teaches its chosen question.
  // Questions marked "Week 7 practice exam" are adapted (options shortened) from the course's
  // Exam live practice slides; the others are TODO team placeholders.
  questionPool: {
    q1: [
      { text: 'Which study strategy feels harder than rereading but works better?',
        options: ['Rereading and highlighting', 'Practice questions (retrieval practice)', 'Rewatching lectures at 1.5x', 'Making the notes look neat'], answer: 1,
        note: '**Retrieval practice** feels worse than rereading but works better (Carpenter et al., 2022).' },
      { text: 'Two adopted, non-biological brothers share the same parents, schools and activities, yet differ in problem-solving. What best explains this?',
        options: ['Genetics', 'Sensitive period', 'Adverse Childhood Experiences (ACEs)', 'Enriched environment'], answer: 0,
        note: 'Same upbringing but different abilities: what is left is **genetics** (nature). (Week 7 practice exam)' },
      { text: 'How does the shift from synaptogenesis to pruning help the developing brain?',
        options: ['It cuts neurons to raise memory capacity', 'It improves efficiency by keeping the most essential connections', 'It favours quantity over quality of connections', 'It favours sensory input over thinking'], answer: 1,
        note: 'Pruning keeps the **most essential connections**, which makes the brain more efficient. (Week 7 practice exam)' }
    ],
    q2: [
      { text: 'Which hormone impairs retrieval during acute stress?',
        options: ['Cortisol', 'Melatonin', 'Oxytocin', 'Insulin'], answer: 0,
        note: 'Stress hormones like **cortisol** block retrieval from long-term memory.' },
      { text: 'Which statement about memory retrieval is FALSE?',
        options: ['Memories become changeable each time they are retrieved', 'Often-retrieved memories become more stable and connected', 'The more a memory is retrieved, the more accurate to the original it gets', 'Repeated recall can strengthen a memory'], answer: 2,
        note: 'Each retrieval makes a memory **changeable**: stronger, but not more accurate to the original. (Week 7 practice exam)' },
      { text: 'What is TRUE about "Jennifer Aniston" (concept) cells?',
        options: ['They respond to images or sounds of a person, not both', 'They fire only for the same setting or outfit', 'They respond to any highly familiar concept', 'They respond to one concept across looks, name and related ideas'], answer: 3,
        note: '**Concept cells** respond to one specific concept however it shows up: face, name or related ideas. (Week 7 practice exam)' }
    ],
    q3: [
      { text: 'Material feels familiar after rereading, but you cannot recall it. This is called:',
        options: ['Emotional contagion', 'A growth mindset', 'The fluency illusion', 'Affect labelling'], answer: 2,
        note: 'Familiar is not the same as remembered: the **fluency illusion** (Week 5 slides).' },
      { text: 'Which best describes experience-dependent plasticity?',
        options: ['Universal inputs wire every brain the same way', 'Development only in critical and sensitive periods', 'Ongoing rewiring shaped by your own unique experiences', 'A fixed window where missing input means permanent loss'], answer: 2,
        note: '**Experience-dependent** plasticity is lifelong rewiring shaped by your own unique experiences. (Week 7 practice exam)' },
      { text: 'How are working memory and inhibitory control related?',
        options: ['They work independently', 'Together they maximize the capacity and relevance of information', 'Working memory filters distractions for inhibitory control', 'They matter for school but little else'], answer: 1,
        note: 'Working memory and inhibitory control are intertwined: together they maximize the **capacity and relevance** of information. (Week 7 practice exam)' }
    ],
    q4: [
      { text: 'Telling yourself "Okay, I\'m panicking" is an example of:',
        options: ['Social comparison', 'The fluency illusion', 'Stimulus-driven attention', 'Affect labelling'], answer: 3,
        note: 'Putting a feeling into words is **affect labelling** (Lieberman et al., 2007).' },
      { text: 'Which statement about the temporal lobe and memory is FALSE?',
        options: ['It mainly handles short-term memory and motor skills', 'It is crucial for episodic and semantic memory', 'Damage can impair recalling the past and imagining the future', 'Its medial part contains concept cells'], answer: 0,
        note: 'Short-term memory is the **prefrontal cortex**, and motor skills are the cerebellum and basal ganglia, not the temporal lobe. (Week 7 practice exam)' }
    ]
  },
  questions: {}, // filled by Rules.pickQuestions at the start of each run

  // TODO team: brain region explanations (two lines + source). Keep them short.
  brain: {
    amygdala: { name: 'Amygdala', text: 'Detects threat and sets off the stress response.\nIt does not respond to logic, so "calm down" rarely works.', source: 'Week 8 slides; McRae et al., 2012' },
    hippocampus: { name: 'Hippocampus', text: 'Helps store and retrieve memories.\nStress hormones like cortisol impair retrieval.', source: 'Week 8 slides' },
    pfc: { name: 'Prefrontal cortex', text: 'Plans, focuses and resists distraction (executive functions).\nStress and sleep loss weaken it.', source: 'Week 6 and Week 8 slides' },
    hypothalamus: { name: 'Hypothalamus', text: 'Part of the stress response system.\nTODO team: add the explanation.', source: 'TODO team' }
  },

  // Shown instead of an exam scene's options while stress is 90+. Every option must lower stress.
  // TODO team: placeholder why cards.
  freeze: {
    text: 'Your mind goes white. The words are just shapes.',
    choices: [
      { label: 'Stare at the page', stress: -5, auto: true, why: 'Freezing is the far end of the stress response. It passes, slowly.' },
      { label: 'Breathe out slower than you breathe in', stress: -15, brain: 'amygdala', why: 'Long exhales shift you toward the calming (parasympathetic) system.' },
      { label: '"Okay. I\'m panicking."', stress: -10, brain: 'amygdala', why: 'Naming the feeling is affect labelling (Lieberman et al., 2007).' },
      { label: 'Put the pen down for a second', stress: -10, why: 'A short pause gives your body a chance to settle.' }
    ]
  },

  // Built fresh for every run by Rules.buildRun from sceneList below. Don't edit.
  scenes: [],

  // Scenes play in this order. Two extras make every run different:
  //   { pool: [sceneA, sceneB, ...] }  one of these is picked at random each run. Keep the
  //                                    variants' numbers the same so the balance stays the same.
  //   chance: 0.35                     this scene only happens in about 35% of runs.
  // Random events added by Claude: the team may rewrite their text.
  sceneList: [
    // ---------- Act 1: Study week ----------
    // TODO team: placeholder text and why cards. Concept: demands vs. resources; planning. Source: Week 8 slides; Week 6 executive functions.
    { id: 'notification', act: 1, bg: 'bedroomDay', prop: 'notification',
      text: 'Your phone lights up: "NSCI 140 Midterm in 7 days."',
      choices: [
        { label: 'Screenshot it, deal with it later', auto: true, why: 'Putting it off keeps stress low now, but the demand has not gone anywhere.' },
        { label: 'Block study time in your calendar', mindset: 1, stress: 5, brain: 'pfc', why: 'Planning turns a vague threat into steps you have the resources for.' },
        { label: 'Ask the group chat if anyone\'s started', stress: -5, why: 'Hearing nobody has started is comforting, but it adds no resources.' },
        { label: 'Open the syllabus and count the topics', prep: 1, stress: 15, brain: 'pfc', why: 'Seeing the real size of the demand is stressful, but now you know what to study.' }
      ] },
    // TODO team: placeholder. Concept: resisting distraction; stimulus-driven vs goal-driven attention. Source: Week 6 slides (Michael case).
    { pool: [
      { id: 'phone', act: 1, bg: 'library', prop: 'phone',
        text: 'First study session. Ten minutes in, your phone buzzes.',
        choices: [
          { label: 'Check it, might be important', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'A buzz grabs stimulus-driven attention. Getting back to the work costs focus.' },
          { label: 'Reply fast, then refocus', why: 'Quick replies feel harmless, but each one pulls you off your goal.' },
          { label: 'Turn on Do Not Disturb', prep: 1, brain: 'pfc', why: 'Removing the cue lets goal-driven attention stay on the work.' },
          { label: 'Put it in another room', prep: 1, stress: 5, brain: 'pfc', why: 'Out of sight helps focus, though being cut off feels uneasy at first.' }
        ] },
      { id: 'sportsGame', act: 1, bg: 'library', prop: 'phone',
        text: 'First study session. Your favourite team\'s game just started.',
        choices: [
          { label: 'Check the score, just once', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'Every score alert grabs stimulus-driven attention. "Just once" turns into every few minutes.' },
          { label: 'Have it on in the background', why: 'Background games still split your attention.' },
          { label: 'Mute score alerts until it ends', prep: 1, brain: 'pfc', why: 'Removing the cue lets goal-driven attention stay on the work.' },
          { label: 'Leave your phone with a friend', prep: 1, stress: 5, brain: 'pfc', why: 'Out of reach helps focus, though missing the big moments stings.' }
        ] },
      { id: 'phoneLive', act: 1, bg: 'library', prop: 'phone',
        text: 'First study session. Notification: your favourite streamer just went live.',
        choices: [
          { label: 'Pop in, it might be a good one', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'A live stream is a strong external cue. Getting back to the work costs focus.' },
          { label: 'Leave it on mute in the corner', why: 'Background content still splits your attention.' },
          { label: 'Turn on Do Not Disturb', prep: 1, brain: 'pfc', why: 'No cue, no pull: goal-driven attention stays on the work.' },
          { label: 'Log out of everything', prep: 1, stress: 5, brain: 'pfc', why: 'Fully cutting off helps focus, at the cost of some FOMO.' }
        ] }
    ] },
    // TODO team: placeholder. Concept: retrieval practice feels worse than rereading but works better. Source: Carpenter et al., 2022.
    { id: 'howStudy', act: 1, bg: 'library', prop: 'notecard',
      text: 'You open your notes. How do you study?',
      choices: [
        { label: 'Reread your notes and highlight', felt: 1, stress: -5, auto: true, why: 'Rereading feels productive because the notes look familiar. Familiar is not the same as remembered.' },
        { label: 'Rewatch lectures at 1.5x', felt: 1, why: 'Rewatching builds the same feeling of familiarity without testing recall.' },
        { label: 'Practice questions, mark what you miss', prep: 2, stress: 10, brain: 'hippocampus', why: 'Retrieval practice feels harder, but it works better (Carpenter et al., 2022).' },
        { label: 'Quiz each other with a classmate', prep: 2, stress: 5, set: 'studyGroup', brain: 'hippocampus', why: 'Testing each other is retrieval practice, with company.' }
      ] },
    // TODO team: placeholder. Concept: metacognition; fluency illusion. Source: Week 5 slides.
    { id: 'ready', act: 1, type: 'quiz', bg: 'bedroomDay', prop: 'quizcard',
      text: 'How ready are you? Rate your confidence, then try a short practice quiz on your study notes so far.',
      why: 'Feeling ready and being ready are different things. Rereading builds the feeling; testing yourself shows the truth.' },
    // TODO team: placeholder. Concept: immediate vs delayed reward. Source: Week 12 slides.
    { pool: [
      { id: 'gamesNight', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Friends invite you to games night.',
        choices: [
          { label: 'Say "maybe" and decide later', stress: 5, auto: true, why: 'Leaving it open means you carry the decision all evening.' },
          { label: 'Go, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'The immediate reward wins. Stress drops, and so does study time.' },
          { label: 'Go, but leave by 10', stress: -10, brain: 'pfc', why: 'A planned break gives some reward now without giving up the later one.' },
          { label: 'Stay in and study', prep: 1, stress: 5, why: 'Choosing the delayed reward adds study time, at the cost of a stressful night in.' }
        ] },
      { id: 'gta', act: 1, bg: 'bedroomNight', prop: 'thought',
        text: 'GTA 6 just came out. Your roommate already has it installed and is yelling for you.',
        choices: [
          { label: 'Watch them play "for a minute"', stress: 5, auto: true, why: 'Half-watching means you carry the decision all evening.' },
          { label: 'Play it, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'The immediate reward wins. Stress drops, and so does study time.' },
          { label: 'One mission, then back to notes', stress: -10, brain: 'pfc', why: 'A planned break gives some reward now without giving up the later one.' },
          { label: 'Headphones on and study', prep: 1, stress: 5, why: 'Choosing the delayed reward adds study time, while the game waits.' }
        ] },
      { id: 'krillion', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Krillion just dropped and literally everyone is talking about it.',
        choices: [
          { label: 'Keep it open in another tab', stress: 5, auto: true, why: 'Half on it, half on your notes: neither gets your full attention.' },
          { label: 'Drop everything, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'The immediate reward wins. Stress drops, and so does study time.' },
          { label: 'Give it 30 minutes, then study', stress: -10, brain: 'pfc', why: 'A planned break gives some reward now without giving up the later one.' },
          { label: 'Save it as a reward for after the exam', prep: 1, stress: 5, why: 'Delaying the reward adds study time, and something to look forward to.' }
        ] },
      { id: 'halloween', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Halloween party tonight. Your friends already picked a costume for you.',
        choices: [
          { label: 'Say "maybe" and decide later', stress: 5, auto: true, why: 'Leaving it open means you carry the decision all evening.' },
          { label: 'Go, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'The immediate reward wins. Stress drops, and so does study time.' },
          { label: 'Go, but leave by 11', stress: -10, brain: 'pfc', why: 'A planned break gives some reward now without giving up the later one.' },
          { label: 'Stay in and study', prep: 1, stress: 5, why: 'Choosing the delayed reward adds study time, at the cost of missing out.' }
        ] }
    ] },
    // Random event. Concept: distraction; immediate vs delayed reward.
    { id: 'pregame', act: 1, chance: 0.35, bg: 'bedroomNight', prop: 'thought',
      text: 'Your roommate is hosting a pregame. The bass is coming through the wall.',
      choices: [
        { label: 'Headphones in, push through', stress: 5, auto: true, why: 'Pushing through noise drains attention you need for the work.' },
        { label: 'Join for 20 minutes', stress: -10, why: 'A short social break lowers stress, if it stays short.' },
        { label: 'Pack up and go to the library', stress: 5, mindset: 1, brain: 'pfc', why: 'Changing your environment is easier than fighting the distraction.' },
        { label: 'Ask them to turn it down', stress: -5, why: 'Asking for what you need takes some nerve, and usually works.' }
      ] },
    // TODO team: placeholder. Concept: empathy; supportive relationships buffer stress. Source: Weeks 8 and 9 slides.
    { id: 'behind', act: 1, if: 'studyGroup', bg: 'library', prop: 'thought',
      text: 'Your study partner sighs: "We\'re so behind."',
      choices: [
        { label: '"Honestly, we\'re cooked"', stress: 15, auto: true, brain: 'amygdala', why: 'Agreeing it is hopeless feeds both of your stress responses.' },
        { label: '"Let\'s just do three more questions"', mindset: 1, stress: 5, why: 'A small, concrete goal turns panic into a challenge you can meet.' },
        { label: 'Admit you\'re stressed too', stress: -5, why: 'Sharing the feeling is support. Supportive relationships buffer stress.' },
        { label: 'Make an excuse and leave', stress: -10, kind: 'disengage', why: 'Leaving drops the stress for now, and the support with it.' }
      ] },

    // ---------- Act 2: Night before ----------
    // TODO team: placeholder. Concept: stretch zone vs stress zone. Source: Week 8 slides.
    { id: 'skipped', act: 2, bg: 'bedroomNight', prop: 'notecard',
      text: 'The night before. You find a topic you skipped.',
      choices: [
        { label: 'Learn it now, it\'ll be on there', prep: 1, stress: 15, auto: true, why: 'Cramming something new tonight can push you from the stretch zone into the stress zone.' },
        { label: 'Skim the summary slide only', stress: 5, why: 'A quick skim gives a little familiarity, not much memory.' },
        { label: 'Let it go, review what you know', mindset: 1, stress: -5, kind: 'calm', why: 'Accepting a gap and reviewing what you know keeps you in the stretch zone.' },
        { label: 'Ask a friend to explain it', prep: 1, stress: 5, brain: 'hippocampus', why: 'A friend\'s explanation gets you the topic with less strain than going it alone.' }
      ] },
    // TODO team: placeholder. Concept: emotional contagion. Source: Week 8 slides.
    { pool: [
      { id: 'screwed', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'A friend texts: "I\'m so screwed."',
        choices: [
          { label: '"Same lol we\'re cooked"', stress: 10, auto: true, brain: 'amygdala', why: 'Stress spreads. Matching their panic raises yours.' },
          { label: 'Send them your notes', mindset: 1, stress: 5, why: 'Helping costs time, but it turns panic into something you can act on.' },
          { label: '"You\'ll be fine, go sleep"', stress: -5, why: 'Calm is contagious too.' },
          { label: 'Turn on Do Not Disturb', why: 'Shutting out the stress cue protects you, but does not help them.' }
        ] },
      { id: 'exPosted', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'Your ex just posted. You can see the preview.',
        choices: [
          { label: 'Watch it. Then watch it again.', stress: 10, auto: true, brain: 'amygdala', why: 'Replaying it keeps the threat response running the night before an exam.' },
          { label: 'Text a friend instead of reacting', mindset: 1, stress: 5, why: 'Reaching out to support costs a little nerve and buffers the stress.' },
          { label: '"Good for them." Back to bed.', stress: -5, why: 'Choosing not to engage lets your body settle.' },
          { label: 'Mute them for tonight', why: 'Removing the cue stops the spiral before it starts.' }
        ] },
      { id: 'tiktokNight', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'Midnight. You open TikTok "for five minutes".',
        choices: [
          { label: 'Keep scrolling', stress: 10, auto: true, brain: 'amygdala', why: 'Endless scrolling keeps your brain switched on and eats into sleep.' },
          { label: 'Send a funny one to a stressed friend, then stop', mindset: 1, stress: 5, why: 'A small moment of connection, with a clear stopping point.' },
          { label: 'Put the phone across the room', stress: -5, why: 'No screen, no pull. Your body can start winding down.' },
          { label: 'Set a 5-minute timer and stick to it', why: 'A limit keeps the break a break.' }
        ] }
    ] },
    // Random event. Concept: focusing on what you can control.
    { id: 'wifi', act: 2, chance: 0.35, bg: 'bedroomNight', prop: 'phone',
      text: 'The Wi-Fi dies. All your notes are in the cloud.',
      choices: [
        { label: 'Refresh until it comes back', stress: 10, auto: true, brain: 'amygdala', why: 'Fixating on what you can\'t control keeps the stress response running.' },
        { label: 'Hotspot off your phone data', stress: 5, why: 'A workaround, with a little extra hassle.' },
        { label: 'Take it as a sign and sleep', stress: -5, kind: 'calm', brain: 'hippocampus', why: 'Sleep is when the day\'s learning gets consolidated.' },
        { label: 'Quiz yourself from memory', mindset: 1, stress: 5, brain: 'hippocampus', why: 'No notes needed: retrieving from memory is the best practice anyway.' }
      ] },
    // TODO team: placeholder. Concept: sleep and memory consolidation. Source: needed (TODO team).
    { id: 'sleep', act: 2, bg: 'bedroomNight', prop: 'thought',
      text: '11 pm. Sleep, or keep going?',
      choices: [
        { label: 'Just one more hour', stress: 5, auto: true, why: 'One more hour tends to become two, and it comes out of your sleep.' },
        { label: 'Sleep now, set two alarms', stress: -5, kind: 'calm', brain: 'hippocampus', why: 'Sleep is when the day\'s learning gets consolidated.' },
        { label: 'Pull an all-nighter', prep: 1, set: 'allNighter', stress: 15, brain: 'pfc', why: 'More material tonight, but losing sleep costs memory tomorrow. (Prep +1 now, -1 at the exam.)' },
        { label: 'Make a one-page summary, then sleep', prep: 1, stress: 5, brain: 'hippocampus', why: 'One last bit of active study, and you still sleep.' }
      ] },
    // Random event. Concept: reappraisal; how you frame a setback.
    { id: 'fireAlarm', act: 2, chance: 0.25, bg: 'bedroomNight', prop: 'thought',
      text: '1 am. Fire alarm. Everyone is standing outside in pyjamas.',
      choices: [
        { label: 'Doomscroll while you wait', stress: 5, auto: true, why: 'Scrolling keeps your brain switched on when it should be winding down.' },
        { label: 'Chat with your neighbours', stress: -5, why: 'A shared bad moment is easier. Social support buffers stress.' },
        { label: 'Run flashcards in your head', mindset: 1, stress: 5, brain: 'hippocampus', why: 'Turning dead time into retrieval practice is a challenge mindset in action.' },
        { label: '"Of course this happens tonight"', mindset: -1, stress: 5, brain: 'amygdala', why: 'Treating it as proof the universe is against you is a threat appraisal.' }
      ] },
    // TODO team: placeholder. Concept: sleep loss and stress hurt memory and the PFC. Source: Week 8 slides.
    { id: 'words', act: 2, type: 'cutscene', if: 'allNighter', bg: 'bedroomNight', prop: 'notecard', pose: 'exhausted', swim: true,
      text: '3 am. You read the same line five times. The words will not stick.',
      why: 'Sleep loss and stress both hurt memory and the prefrontal cortex.' },

    // ---------- Act 3: Exam day ----------
    // TODO team: placeholder. Concept: bottom-up calming; higher arousal is not automatically bad. Source: Week 8 slides.
    { pool: [
      { id: 'morning', act: 3, bg: 'walk', prop: 'thought',
        text: 'Exam morning.',
        choices: [
          { label: 'Snooze, grab coffee and run', stress: 10, auto: true, why: 'Rushing starts the day in high gear.' },
          { label: 'Walk the long way, no notes', stress: -10, kind: 'calm', why: 'Moving calms the body from the bottom up.' },
          { label: 'Reread notes over breakfast', stress: 5, why: 'Last-minute rereading mostly adds worry.' },
          { label: 'Hype playlist on the way', stress: 5, mindset: 1, why: 'Higher arousal is not automatically bad. Energised can mean ready.' }
        ] },
      { id: 'bus', act: 3, bg: 'walk', prop: 'phone',
        text: 'Exam morning. The bus is 12 minutes late and the app just says "Due".',
        choices: [
          { label: 'Refresh the transit app nonstop', stress: 10, auto: true, why: 'Watching the countdown keeps you in high gear.' },
          { label: 'Walk instead, no notes', stress: -10, kind: 'calm', why: 'Moving calms the body from the bottom up.' },
          { label: 'Flashcards at the stop', stress: 5, why: 'Last-minute review mostly adds worry.' },
          { label: 'Hype playlist while you wait', stress: 5, mindset: 1, why: 'Higher arousal is not automatically bad. Energised can mean ready.' }
        ] },
      { id: 'overslept', act: 3, bg: 'bedroomDay', prop: 'thought', pose: 'panicked',
        text: 'You overslept. The exam starts in 25 minutes.',
        choices: [
          { label: 'Sprint out the door, no breakfast', stress: 10, auto: true, brain: 'amygdala', why: 'Panic mode starts the day in high gear.' },
          { label: 'One slow breath, then walk fast', stress: -10, kind: 'calm', why: 'Even a little control over your breathing and body calms you from the bottom up.' },
          { label: 'Cram notes on the way', stress: 5, why: 'Last-minute cramming mostly adds worry.' },
          { label: 'Hype playlist on the run', stress: 5, mindset: 1, why: 'Higher arousal is not automatically bad. Energised can mean ready.' }
        ] }
    ] },
    // TODO team: placeholder. Concept: social comparison as a threat trigger. Source: Week 8 slides.
    { id: 'hallway', act: 3, bg: 'hallway', prop: 'thought',
      text: 'Outside the room, classmates quiz each other on something you don\'t recognise.',
      choices: [
        { label: 'Listen in', stress: 10, auto: true, brain: 'amygdala', why: 'Comparing yourself to others is a classic threat trigger.' },
        { label: 'Ask them to explain it quickly', stress: 10, why: 'You might learn it, but you are inviting more comparison.' },
        { label: 'Headphones in, eyes closed', stress: -5, kind: 'calm', why: 'Cutting off the comparison protects your focus.' },
        { label: '"It\'s probably not even on it"', mindset: 1, stress: -25, kind: 'disengage', why: 'Dismissing the threat lowers stress, and your engagement with it.' }
      ] },
    // TODO team: placeholder. Concept: reframing the body's response; the amygdala does not respond to logic. Source: Yeager et al., 2022; McRae et al., 2012.
    { id: 'walkingIn', act: 3, bg: 'hallway', prop: 'thought',
      text: 'Walking in. Your heart is pounding.',
      choices: [
        { label: 'Tell yourself to calm down', stress: 5, auto: true, brain: 'amygdala', why: 'The amygdala does not respond to logic. Ordering yourself to calm down rarely works.' },
        { label: '"Okay, my body\'s getting ready"', mindset: 1, why: 'Reframing the racing heart as getting ready changes how you respond to it (Yeager et al., 2022).' },
        { label: 'Shake out your hands and shoulders', stress: -10, kind: 'calm', why: 'Moving releases tension from the body up.' },
        { label: '"Ugh, why am I always like this"', mindset: -1, stress: 5, why: 'Judging yourself adds a second threat on top of the first.' }
      ] },
    // TODO team: placeholder. Concept: over-arousal; affect labelling. Source: Lieberman et al., 2007.
    { id: 'bathroom', act: 3, if: function (s) { return s.stress > 75; }, bg: 'bathroom', prop: 'phone',
      text: 'The bathroom. Two minutes before the start.',
      choices: [
        { label: 'Scroll your phone', stress: -10, auto: true, kind: 'disengage', why: 'Scrolling distracts, but does little to calm the body.' },
        { label: 'Splash cold water on your face', stress: -10, kind: 'calm', why: 'A physical jolt can interrupt the spiral.' },
        { label: 'Breathe out slower than you breathe in', stress: -15, kind: 'calm', brain: 'amygdala', why: 'Long exhales shift you toward the calming (parasympathetic) system.' },
        { label: 'Text a friend "I\'m freaking out"', stress: -10, kind: 'calm', brain: 'amygdala', why: 'Putting the feeling into words is affect labelling (Lieberman et al., 2007).' }
      ] },
    // TODO team: placeholder. Concept: momentum; staying in the window.
    { id: 'easy', act: 3, bg: 'examhall', prop: 'exam', question: 'q1',
      text: 'The exam starts. Question 1 looks easy.',
      choices: [
        { label: 'Speed through to bank time', stress: 5, auto: true, why: 'Rushing keeps arousal climbing.' },
        { label: 'Answer, then read the next one carefully', stress: -5, kind: 'calm', why: 'A steady rhythm keeps you in the window.' },
        { label: 'Double-check it, seems too easy', stress: 5, why: 'Doubting an easy question spends calm you will need later.' },
        { label: 'Flip through the whole exam first', stress: 10, mindset: 1, why: 'Seeing everything is stressful, but now you know what is coming.' }
      ] },
    // TODO team: placeholder. Concept: cortisol impairs retrieval from long-term memory.
    { id: 'blank', act: 3, bg: 'examhall', prop: 'exam', question: 'q2', blur: true,
      text: 'Question 2. You read it twice. Nothing.',
      choices: [
        { label: 'Reread it. Again. And again.', stress: 10, auto: true, brain: 'hippocampus', why: 'Pushing harder raises cortisol, which blocks recall further.' },
        { label: 'Skip it, come back later', skip: true, why: 'Moving on stops the spiral. You can come back at the end if you are calm enough.' },
        { label: 'Breathe out slowly, reread once', stress: -15, kind: 'calm', brain: 'amygdala', why: 'Long exhales shift you toward the calming (parasympathetic) system.' },
        { label: '"Okay, I blanked. It happens."', stress: -10, kind: 'calm', brain: 'amygdala', why: 'Naming what happened takes some of the threat out of it.' }
      ] },
    // TODO team: placeholder. Concept: exam pace.
    { id: 'leaving', act: 3, bg: 'examhall', prop: 'exam', question: 'q3',
      text: 'People start leaving early.',
      choices: [
        { label: 'Speed up to finish with them', stress: 10, mindset: -1, auto: true, why: 'Other people\'s pace becomes your threat.' },
        { label: 'Keep your pace, speed isn\'t marks', mindset: 1, brain: 'pfc', why: 'Speed is not marks. Your pace is yours.' },
        { label: 'Wonder what they knew that you didn\'t', mindset: -1, stress: 5, why: 'Comparing yourself pulls attention away from the page.' },
        { label: 'Sip of water, reset', stress: -5, kind: 'calm', why: 'A small physical reset brings you back.' }
      ] },
    // TODO team: placeholder. Concept: online metacognition. Source: Week 5 slides.
    { id: 'fiveMin', act: 3, bg: 'examhall', prop: 'exam', question: 'q4',
      text: 'Five minutes left. One more question.',
      choices: [
        { label: 'Second-guess a few answers', stress: 5, auto: true, why: 'Checking without a reason mostly adds doubt.' },
        { label: 'Go back to the one you skipped', reopen: true, brain: 'pfc', why: 'Knowing which question you left is metacognition in action. (Only possible below 70 stress.)' },
        { label: 'Pen down, breathe', stress: -10, kind: 'calm', why: 'Ending calmly lets you leave the stress in the room.' },
        { label: 'Hand it in early, you\'re done', stress: -20, kind: 'disengage', why: 'Relief now, but you give up the time you had left.' }
      ] },

    // ---------- Act 4: After ----------
    // TODO team: placeholder. Concept: reappraisal; growth mindset.
    { id: 'grade', act: 4, bg: 'bedroomDay', prop: 'grade',
      text: 'The grade comes back.',
      choices: [
        { label: 'Close the tab, don\'t look closer', stress: -10, auto: true, kind: 'disengage', why: 'Avoiding the result avoids the sting, and the lesson.' },
        { label: 'Compare grades with friends', stress: 10, mindset: -1, why: 'Comparison turns a grade into a ranking.' },
        { label: 'Check which ones you missed and why', mindset: 1, stress: 5, brain: 'pfc', why: 'Treating mistakes as information is a growth mindset.' },
        { label: '"I\'m just bad at this subject"', mindset: -1, why: 'Treating a grade as a fixed trait makes the next exam more threatening.' }
      ] },
    { id: 'final', act: 4, type: 'ending', bg: 'walk' }
  ],

  // TODO team: placeholder ending text.
  endings: {
    window: { title: 'In the window', text: 'Stressed and sharp. Some stress helped you focus.',
      high: 'You\'d done the work, and you kept your head enough to use it.',
      low: 'You stayed steady, but calm can\'t recall what was never studied.' },
    overwhelmed: { title: 'Overwhelmed', text: 'Stress blocked recall; it says nothing about your intelligence.',
      high: 'You knew more than you showed.',
      low: 'And there wasn\'t much prep to fall back on either.' },
    checkedOut: { title: 'Checked out', text: 'Too calm to care. Low arousal also hurts performance.',
      high: 'The knowledge was there, but you weren\'t really in the room.',
      low: 'Nothing was pushing you to engage, before or during the exam.' }
  },
  // TODO team: placeholder ending brain explanation, takeaways and epilogue.
  endingBrain: 'Moderate stress keeps the prefrontal cortex and hippocampus working. Too much, and stress hormones block recall; too little, and nothing pushes you to engage.',
  takeaways: [
    'Plan: turn "the midterm" into blocks of time and a list of topics.',
    'Test yourself instead of rereading. If it feels hard, it is working.',
    'Sleep before the exam instead of cramming all night.',
    'Breathe out slower than you breathe in.',
    'Racing heart? "My body is getting ready."',
    'Name the feeling: "Okay, I\'m panicking."',
    'Keep your own pace. Speed isn\'t marks.'
  ],
  epilogue: {
    wider: 'Next exam. You walk in a little more sure that stress is something you can ride. Your window is wider.',
    same: 'Next exam. Same river, same banks. You know a bit more about how to steer.',
    narrower: 'Next exam. The threat feels bigger before it starts. Your window is narrower, but windows can widen again.'
  },
  // TODO team: verify link
  wellnessUrl: 'https://students.ubc.ca/health'
};
if (typeof module !== 'undefined') module.exports = STORY;

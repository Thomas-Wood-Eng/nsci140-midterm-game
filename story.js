// All game content. Teammates edit ONLY this file.
// Scenes play in the order listed. A scene with `if` is a bonus scene shown only when its
// condition holds (a flag name, or a function of the game state).
// Choice fields: label, stress, mindset, prep, felt, set (flag name), kind ('calm' | 'disengage'),
// auto (the timeout default; exactly one per scene), why (the "what just happened" card),
// brain (region to highlight), skip / reopen (exam question 2 skip and go-back).
// Text in **double stars** is highlighted.
//
// Scene text and choice labels: team text (Thomas, fill-in doc, 2026-11-27).
// Why cards: the course slides' own wording; the slide is in the comment after each choice.
// Slide key (slide = PDF page):
//   W2     Week 2 "NSCI140 Neuroplasticity1" slides
//   W4     Week 4 "NSCI140 memory and learning" slides
//   W5-Met Week 5 "metacognition and learning" live slides
//   W6-EF  Week 6 "NSCI140 EF" slides
//   W6-Att Week 6 "Cognitive Control & Attention" live lecture slides
//   W7     Week 7 "Exam live practice with answers"
//   W8-LB  Week 8 "learning vs surviving: emotion and stress" slides
//   W8-Liv Week 8 "From Surviving to Thriving" live slides
//   W9-E   Week 9 empathy slides;  W9-SB  Week 9 "The Social Brain" slides
//   W12    Week 12 "Reward motivation" slides
//   (none) no slide backs it; the team's own reasoning
var STORY = {
  // Team text (Thomas, 2026-11-26).
  intro: 'You are a first-year student preparing for your first midterm exam. How will your choices prepare you? Will you stay within the window of tolerance?',
  acts: { 1: 'Act 1: Study week', 2: 'Act 2: Night before', 3: 'Act 3: Exam day', 4: 'Act 4: After' },

  // Exam questions. Each run picks ONE question per slot at random (q1 to q4).
  // Prep N covers slots 1..N in this order. The study note for a slot teaches its chosen question.
  // Questions marked "Week 7 practice exam" are adapted (options shortened) from the course's
  // Exam live practice slides; the other two (q1 retrieval practice, q2 cortisol) were kept by the team.
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
      { text: 'Which best describes experience-dependent plasticity?',
        options: ['Universal inputs wire every brain the same way', 'Development only in critical and sensitive periods', 'Ongoing rewiring shaped by your own unique experiences', 'A fixed window where missing input means permanent loss'], answer: 2,
        note: '**Experience-dependent** plasticity is lifelong rewiring shaped by your own unique experiences. (Week 7 practice exam)' },
      { text: 'How are working memory and inhibitory control related?',
        options: ['They work independently', 'Together they maximize the capacity and relevance of information', 'Working memory filters distractions for inhibitory control', 'They matter for school but little else'], answer: 1,
        note: 'Working memory and inhibitory control are intertwined: together they maximize the **capacity and relevance** of information. (Week 7 practice exam)' }
    ],
    q4: [
      { text: 'Which statement about the temporal lobe and memory is FALSE?',
        options: ['It mainly handles short-term memory and motor skills', 'It is crucial for episodic and semantic memory', 'Damage can impair recalling the past and imagining the future', 'Its medial part contains concept cells'], answer: 0,
        note: 'Short-term memory is the **prefrontal cortex**, and motor skills are the cerebellum and basal ganglia, not the temporal lobe. (Week 7 practice exam)' }
    ]
  },
  questions: {}, // filled by Rules.pickQuestions at the start of each run

  // Brain region explanations: line 1 \n line 2. Team text (Thomas, dictation 01, 2026-11-26).
  brain: {
    amygdala: { name: 'Amygdala', text: 'The amygdala processes emotions, detects threats and links feelings to memories, which sets off the stress response.\nIt doesn\'t really respond to logic; it\'s the main emotional hub.', source: 'Week 8 "learning vs surviving" slides 14, 24, 28, 49' },
    hippocampus: { name: 'Hippocampus', text: 'The hippocampus is responsible for storing and retrieving memories.\nStress hormones, like cortisol, impair retrieval, so you don\'t remember as well.', source: 'Week 8 "learning vs surviving" slides 17, 31' },
    pfc: { name: 'Prefrontal cortex', text: 'It drives executive function, higher level skills.\nStress and sleep loss weaken it dramatically.', source: 'Week 8 "learning vs surviving" slide 17; Week 6 EF slide 33' },
    hypothalamus: { name: 'Hypothalamus', text: 'The hypothalamus acts as the brain\'s sort of main command center for stress.\nUnder stress, it triggers fast nerve responses through the sympathetic nervous system and slower hormone cascade responses through the adrenal-cortical system (the HPA axis).', source: 'Week 8 "learning vs surviving" slides 24, 30; Week 8 live slides slide 19' }
  },

  // Shown instead of an exam scene's options while stress is 90+. Every option must lower stress.
  freeze: {
    text: 'You are freezing. You need to de-stress.',
    choices: [
      { label: 'Stare at the wall', stress: -5, auto: true, why: 'Freeze or shutdown is a response to extreme stress, outside the window of tolerance.' }, // W8-Liv 10
      { label: 'Deep breaths', stress: -15, brain: 'amygdala', why: 'Deep breathing shifts you from the sympathetic to the parasympathetic system, which calms the body down.' }, // W8-LB 25, 49
      { label: 'Identify the panic', stress: -10, brain: 'amygdala', why: 'Name it to tame it: affect labelling reduces the amygdala\'s response (Lieberman et al., 2007).' }, // W8-Liv 25; W8-LB 51
      { label: 'Close your eyes', stress: -10, why: 'Limbic fear and anxiety can be reduced by physiological regulation.' } // W8-LB 48
    ]
  },

  // Built fresh for every run by Rules.buildRun from sceneList below. Don't edit.
  scenes: [],

  // Scenes play in this order. Two extras make every run different:
  //   { pool: [sceneA, sceneB, ...] }  one of these is picked at random each run. Keep the
  //                                    variants' numbers the same so the balance stays the same.
  //   chance: 0.35                     this scene only happens in about 35% of runs.
  sceneList: [
    // ---------- Act 1: Study week ----------
    // Concept: demands vs. resources; planning.
    { id: 'notification', act: 1, bg: 'bedroomDay', prop: 'notification',
      text: 'A calendar notification goes off. You have an NSCI midterm next week.',
      choices: [
        { label: 'Make a study plan', prep: 1, mindset: 1, stress: 15, brain: 'pfc', why: 'Seeing the whole workload is stressful, but planning is an executive function, and planning your study time is metacognitive control.' }, // W6-EF 6; W5-Met 10
        { label: 'Ask your friends how confident they feel', stress: 5, why: 'Comparing yourself to others can become a threat: "I must be doing something wrong".' }, // W8-Liv 23
        { label: 'Study later', auto: true, why: 'Putting it off keeps stress low now, but the demands stay bigger than your resources.' }, // W8-LB 35
        { label: 'Begin a full note re-write', felt: 1, stress: 10, why: 'Rewriting is rote learning: it raises your confidence more than retrieval does, but not your long-term memory.' } // W4 19, 20
      ] },
    // Concept: resisting distraction; stimulus-driven vs goal-directed attention.
    { pool: [
      { id: 'phone', act: 1, bg: 'library', prop: 'phone',
        text: 'It\'s your first big study session and your phone won\'t stop buzzing.',
        choices: [
          { label: 'See why it\'s buzzing and reply to the group chat', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'A buzz grabs stimulus-driven (bottom-up) attention and pulls you off your goal.' }, // W6-Att 22, 24
          { label: 'Quick read but don\'t get involved', why: 'Your attention is limited. Even a quick look spends some of it.' }, // W6-Att 17
          { label: 'Power off the phone', prep: 1, stress: 5, brain: 'pfc', why: 'No cue, no pull: goal-directed (top-down) attention stays on the work, though being cut off feels uneasy.' }, // W6-Att 22
          { label: 'DND on the rest of the night', prep: 1, brain: 'pfc', why: 'Inhibitory control filters out distractions, so attention stays on the work.' } // W6-Att 10; W6-EF 6
        ] },
      { id: 'sportsGame', act: 1, bg: 'library', prop: 'phone',
        text: 'It\'s your first big study session but your favourite team just kicked off.',
        choices: [
          { label: 'Check the score every 30 mins', why: 'Each check is a stimulus-driven pull, but planned checks keep it contained.' }, // W6-Att 24
          { label: 'Watch it in the background', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'A game in the background splits your limited attention between two things.' }, // W6-Att 17
          { label: 'You\'ll watch the highlights later', prep: 1, stress: 5, brain: 'pfc', why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' }, // W12 31
          { label: 'Phone on DND', prep: 1, brain: 'pfc', why: 'Inhibitory control filters out distractions, so attention stays on the work.' } // W6-Att 10; W6-EF 6
        ] },
      { id: 'phoneLive', act: 1, bg: 'library', prop: 'phone',
        text: 'It\'s your first big study session but a banger video just dropped from your favourite YouTuber.',
        choices: [
          { label: 'It\'s only 30 mins...', stress: 5, prep: -1, auto: true, brain: 'pfc', why: 'Dopamine drives "wanting": the desire for a reward, not the pleasure of it.' }, // W12 14
          { label: 'The video can wait until after the exam', prep: 1, stress: 5, brain: 'pfc', why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' }, // W12 31
          { label: 'Background content for studying', why: 'Background content still splits your limited attention.' }, // W6-Att 17
          { label: 'Turn off your phone', prep: 1, brain: 'pfc', why: 'No cue, no pull: goal-directed (top-down) attention stays on the work.' } // W6-Att 22
        ] }
    ] },
    // Concept: retrieval practice feels worse than rereading but works better.
    { id: 'howStudy', act: 1, bg: 'library', prop: 'notecard',
      text: 'What is your study method?',
      choices: [
        { label: 'Reread your notes and highlight', felt: 1, stress: -5, auto: true, why: 'Rereading is rote learning: it raises your confidence more than retrieval does, but not your long-term memory.' }, // W4 19, 20
        { label: 'Rewatch lectures at 1.5x speed', felt: 1, why: 'Rewatching is rote learning too. It feels efficient in the short term.' }, // W4 19
        { label: 'Do practice questions and write what you miss', prep: 2, stress: 10, brain: 'hippocampus', why: 'Retrieval feels harder, but it is more efficient for long-term memory (Carpenter et al., 2022).' }, // W4 18, 20
        { label: 'Explain content to your friend who is behind', prep: 2, stress: 5, set: 'studyGroup', brain: 'hippocampus', why: 'Explaining without notes means retrieving it from memory.' } // W4 18; W7 40
      ] },
    // Concept: metacognition; does your confidence track your performance?
    { id: 'ready', act: 1, type: 'quiz', bg: 'bedroomDay', prop: 'quizcard',
      text: 'Test your metacognition. Rate your confidence, then try a short practice quiz on your study notes so far.',
      why: 'Feeling ready and being ready are different things. Rereading builds the feeling; testing yourself shows the truth.' }, // W5-Met 12; W4 19
    // Concept: immediate vs delayed reward.
    { pool: [
      { id: 'gamesNight', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Friends invite you to games night.',
        choices: [
          { label: 'Say "maybe" and decide later', stress: 5, auto: true, why: 'Leaving it open means you carry the decision all evening.' }, // W6-EF 21 (weak fit: working memory is very short term)
          { label: 'Go, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'Impulsive desire (limbic system) wins over goal-directed motivation (PFC).' }, // W12 31
          { label: 'Go, but leave by 10', stress: -10, brain: 'pfc', why: 'A balance of wanting and liking keeps you engaged and motivated toward a goal.' }, // W12 18
          { label: 'Stay in and study', prep: 1, stress: 5, why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' } // W12 31
        ] },
      { id: 'gta', act: 1, bg: 'bedroomNight', prop: 'thought',
        text: 'GTA 6 is out. Your roommate already has it pre-installed.',
        choices: [
          { label: 'Watch them play "for a minute"', stress: 5, auto: true, why: 'Half-watching means you carry the decision all evening.' }, // W6-EF 21 (weak fit: working memory is very short term)
          { label: 'Play it, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'Impulsive desire (limbic system) wins over goal-directed motivation (PFC).' }, // W12 31
          { label: 'Study for an hour, then take a break', stress: -10, brain: 'pfc', why: 'A balance of wanting and liking keeps you engaged and motivated toward a goal.' }, // W12 18
          { label: 'Headphones on and study', prep: 1, stress: 5, why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' } // W12 31
        ] },
      { id: 'krillion', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Today\'s Krillion just dropped.',
        choices: [
          { label: 'Save today\'s dive for after you study', stress: 5, auto: true, why: 'Delaying the reward keeps it as something to look forward to.' }, // W12 14
          { label: 'Binge Unlimited mode, you\'ve earned it', stress: -20, prep: -1, kind: 'disengage', why: 'Dopamine drives "wanting": the desire for a reward, not the pleasure of it.' }, // W12 14
          { label: 'Play today\'s dive, then study', stress: -10, brain: 'pfc', why: 'A balance of wanting and liking keeps you engaged and motivated toward a goal.' }, // W12 18
          { label: 'Stay locked in. No Krillion today', prep: 1, stress: 5, why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' } // W12 31
        ] },
      { id: 'halloween', act: 1, bg: 'bedroomNight', prop: 'phone',
        text: 'Halloween party tonight. Exam in 2 days.',
        choices: [
          { label: 'Say "maybe" and decide later', stress: 5, auto: true, why: 'Leaving it open means you carry the decision all evening.' }, // W6-EF 21 (weak fit: working memory is very short term)
          { label: 'It\'s Halloween, I\'m going out', stress: -20, prep: -1, kind: 'disengage', why: 'Impulsive desire (limbic system) wins over goal-directed motivation (PFC).' }, // W12 31
          { label: 'Go, but leave by 11', stress: -10, brain: 'pfc', why: 'A balance of wanting and liking keeps you engaged and motivated toward a goal.' }, // W12 18
          { label: 'Stay in and study', prep: 1, stress: 5, why: 'Goal-directed motivation (PFC) wins over impulsive desire (limbic system).' } // W12 31
        ] }
    ] },
    // Random event. Concept: distraction; immediate vs delayed reward.
    { id: 'pregame', act: 1, chance: 0.35, bg: 'bedroomNight', prop: 'thought',
      text: 'Your roommate is hosting a pregame. The bass is vibrating your skull.',
      choices: [
        { label: 'Headphones in, push through', stress: 5, auto: true, why: 'Blocking out noise uses up inhibitory control you need for the work.' }, // W6-Att 10
        { label: 'Join for 20 minutes', stress: -10, why: 'A balance of wanting and liking keeps you engaged and motivated toward a goal.' }, // W12 18
        { label: 'Pack up and go to the library', stress: 5, mindset: 1, brain: 'pfc', why: 'Changing your environment is easier than fighting the distraction.' }, // W6-Att 24; W6-Att 10
        { label: 'Join the party', stress: -15, kind: 'disengage', why: 'Impulsive desire (limbic system) wins over goal-directed motivation (PFC).' } // W12 31
      ] },
    // Concept: empathy; supportive relationships buffer stress.
    { id: 'behind', act: 1, if: 'studyGroup', bg: 'library', prop: 'thought',
      text: 'Your study partner sighs: "We\'re so behind."',
      choices: [
        { label: '"Honestly, we\'re cooked"', stress: 15, auto: true, brain: 'amygdala', why: 'Emotion contagion: shared heart rate and breathing reflect shared arousal.' }, // W9-E 14
        { label: '"Let\'s just do three more questions"', mindset: 1, stress: 5, why: 'A challenge appraisal: "It\'s hard, but I can cope."' }, // W8-Liv 17
        { label: 'Admit you\'re stressed too', stress: -5, why: 'Physiological synchrony can support emotional co-regulation. Name it to tame it.' }, // W9-E 14; W8-Liv 25
        { label: 'Make an excuse and leave', stress: -10, kind: 'disengage', why: 'Humans have a basic and fundamental need to belong and connect.' } // W9-SB 28
      ] },

    // ---------- Act 2: Night before ----------
    // Concept: stretch zone vs stress zone.
    { id: 'skipped', act: 2, bg: 'bedroomNight', prop: 'notecard',
      text: '\'Twas the night before the exam and you find a topic you missed.',
      choices: [
        { label: 'Lock in. It could be on the exam', prep: 1, stress: 15, auto: true, why: 'When demands far outweigh resources, you leave the stretch zone for the stress zone.' }, // W8-LB 34, 36
        { label: 'Skim the summary slide only', stress: 5, why: 'Skimming is rote learning: a little familiarity, not much memory.' }, // W4 18, 19
        { label: 'Let it go, review what you know', mindset: 1, stress: -5, kind: 'calm', why: '"Emotional safety + cognitive stretch = optimal learning conditions."' }, // W8-LB 36
        { label: 'Ask a friend to explain it', prep: 1, stress: 5, brain: 'hippocampus', why: 'Help from others expands your resources to match the demand.' } // W8-LB 36
      ] },
    // Concept: emotional contagion; social threat.
    { pool: [
      { id: 'screwed', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'A friend texts: "I\'m so screwed."',
        choices: [
          { label: '"Same lol we\'re cooked"', stress: 10, auto: true, brain: 'amygdala', why: 'Emotion contagion: shared heart rate and breathing reflect shared arousal.' }, // W9-E 14
          { label: 'Send them your notes', mindset: 1, stress: 5, why: 'Feeling for someone, not just with them, supports prosocial motivation.' }, // W9-E 18
          { label: '"It\'s only one exam"', stress: -5, why: 'Reappraisal: reinterpreting the situation changes its emotional impact.' }, // W8-LB 38
          { label: 'Turn on Do Not Disturb', why: 'Shutting out the stress cue protects you, but does not help them.' } // W9-E 21
        ] },
      { id: 'exPosted', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'Your ex just posted.',
        choices: [
          { label: 'Cyberstalk your ex', stress: 10, auto: true, brain: 'amygdala', why: 'Social rejection activates the same alarm system as physical pain.' }, // W9-SB 19 (Eisenberger and Lieberman, 2004)
          { label: 'Text a friend instead of reacting', mindset: 1, stress: 5, why: 'Humans have a basic and fundamental need to belong and connect.' }, // W9-SB 28
          { label: 'Oops forgot to block them', stress: -5, why: 'Blocking removes the cue for good, so your body can settle.' }, // W6-Att 24
          { label: 'Don\'t even pick up the phone', why: 'Not engaging keeps the cue out, for tonight at least.' } // W6-Att 24
        ] },
      { id: 'tiktokNight', act: 2, bg: 'bedroomNight', prop: 'phone',
        text: 'Midnight. Doomscrolling time.',
        choices: [
          { label: 'Keep scrolling', stress: 10, auto: true, brain: 'amygdala', why: 'Dopamine signals reward anticipation ("wanting"), so the next video always pulls.' }, // W12 14
          { label: 'Respond to your streaks then put it away', mindset: 1, stress: 5, why: 'A small moment of connection, with a clear stopping point.' }, // W9-SB 28
          { label: 'Put the phone across the room', stress: -5, why: 'No screen, no pull. Adequate sleep is crucial for memory consolidation.' }, // W2 34
          { label: 'Set a 15-minute timer and stick to it', why: 'Inhibitory control is a core executive function.' } // W6-EF 6
        ] }
    ] },
    // Random event. Concept: focusing on what you can control.
    { id: 'wifi', act: 2, chance: 0.35, bg: 'bedroomNight', prop: 'phone',
      text: 'The Wi-Fi dies. All your notes are in the cloud.',
      choices: [
        { label: 'Refresh until it comes back', stress: 10, auto: true, brain: 'amygdala', why: 'Worry: thinking over and over about negative things that might happen.' }, // W8-LB 48
        { label: 'Commute and find a school computer', stress: 5, why: 'A challenge appraisal: "It\'s hard, but I can cope."' }, // W8-Liv 17
        { label: 'Take it as a sign and sleep', stress: -5, kind: 'calm', brain: 'hippocampus', why: 'Adequate sleep is crucial for neuroplasticity and memory consolidation.' }, // W2 34
        { label: 'Quiz yourself from memory', mindset: 1, stress: 5, brain: 'hippocampus', why: '"Think and answer from memory, no notes!"' } // W7 40; W4 18
      ] },
    // Concept: sleep and memory consolidation.
    { id: 'sleep', act: 2, bg: 'bedroomNight', prop: 'thought',
      text: '11 pm. Time for bed?',
      choices: [
        { label: 'Just one more hour', stress: 5, auto: true, why: 'One more hour tends to become two, and it comes out of your sleep.' }, // W2 34; W6-EF 33 (sleep part only)
        { label: 'Sleep now, set two alarms', stress: -5, kind: 'calm', brain: 'hippocampus', why: 'Adequate sleep is crucial for neuroplasticity and memory consolidation.' }, // W2 34; W4 13
        { label: 'Pull an all-nighter', prep: 1, set: 'allNighter', stress: 15, brain: 'pfc', why: 'Under stress and sleep deprivation, the PFC and executive functions are the first to suffer, and to suffer the most. (Prep +1 now, -1 at the exam.)' }, // W6-EF 33
        { label: 'Make a one-page summary, then sleep', prep: 1, stress: 5, brain: 'hippocampus', why: 'One last bit of active study, then sleep consolidates it.' } // W4 13
      ] },
    // Random event. Concept: reappraisal; how you frame a setback.
    { id: 'fireAlarm', act: 2, chance: 0.25, bg: 'bedroomNight', prop: 'thought',
      text: '1 am. Fire alarm goes off.',
      choices: [
        { label: 'Doomscroll while you wait', stress: 5, auto: true, why: 'Dopamine signals reward anticipation ("wanting"), so the next video always pulls.' }, // W12 14
        { label: 'Chat with your neighbours', stress: -5, why: 'Physiological synchrony can support emotional co-regulation.' }, // W9-E 14
        { label: 'Run flashcards in your head', mindset: 1, stress: 5, brain: 'hippocampus', why: '"Think and answer from memory, no notes!"' }, // W7 40
        { label: '"Of course this happens tonight"', mindset: -1, stress: 5, brain: 'amygdala', why: 'A threat appraisal: "It\'s hard, I can\'t handle this."' } // W8-Liv 17
      ] },
    // Concept: sleep loss and stress hurt memory and the PFC.
    { id: 'words', act: 2, type: 'cutscene', if: 'allNighter', bg: 'bedroomNight', prop: 'notecard', pose: 'exhausted', swim: true,
      text: '5 am. You read the same line five times. The words just don\'t make any sense.',
      why: 'Under stress and sleep deprivation, the PFC and executive functions are the first to suffer, and to suffer the most.' }, // W6-EF 33; W8-LB 17

    // ---------- Act 3: Exam day ----------
    // Concept: bottom-up calming; higher arousal is not automatically bad.
    { pool: [
      { id: 'morning', act: 3, bg: 'walk', prop: 'thought',
        text: 'It\'s the big day. Time to get up.',
        choices: [
          { label: 'Snooze, grab coffee and run', stress: 10, auto: true, why: 'Rushing sets off the stress response: adrenaline and cortisol raise alertness and readiness for action.' }, // W8-LB 22
          { label: 'Walk the long way, no notes', stress: -10, kind: 'calm', why: 'Use physiological input to calm the amygdala, like moving your body.' }, // W8-LB 49
          { label: 'Reread notes over breakfast', stress: 5, why: 'Last-minute rereading is rote learning, and mostly adds worry.' }, // W4 19; W8-LB 48
          { label: 'Get hyped on the way to the exam', stress: 5, mindset: 1, why: 'Arousal is not necessarily panic: it is mobilized resources fueling performance.' } // W8-Liv 22 (Yeager et al., 2022)
        ] },
      { id: 'bus', act: 3, bg: 'walk', prop: 'phone',
        text: 'Exam morning. The bus is 12 minutes late and the transit app isn\'t loading.',
        choices: [
          { label: 'Refresh the transit app nonstop', stress: 10, auto: true, why: 'Worry: thinking over and over about negative things that might happen.' }, // W8-LB 48
          { label: 'Walk. You\'ll get there in time if you hustle', stress: -10, kind: 'calm', why: 'Use physiological input to calm the amygdala, like moving your body.' }, // W8-LB 49
          { label: 'Flashcards at the stop', stress: 5, why: 'Last-minute review mostly adds worry.' }, // W8-LB 48
          { label: 'Trust the bus will arrive', stress: 5, mindset: 1, why: 'A challenge appraisal: "It\'s hard, but I can cope."' } // W8-Liv 17
        ] },
      { id: 'overslept', act: 3, bg: 'bedroomDay', prop: 'thought', pose: 'panicked',
        text: 'You overslept. The exam starts in 30 minutes.',
        choices: [
          { label: 'Sprint out the door, no breakfast', stress: 10, auto: true, brain: 'amygdala', why: 'Rushing sets off the stress response: adrenaline and cortisol raise alertness and readiness for action.' }, // W8-LB 22
          { label: 'One slow breath, then walk fast', stress: -10, kind: 'calm', why: 'Deep breathing shifts you from the sympathetic to the parasympathetic system.' }, // W8-LB 49
          { label: 'Cram notes on the way', stress: 5, why: 'Last-minute cramming is rote learning, and mostly adds worry.' }, // W4 19; W8-LB 48
          { label: 'Get an Uber, you cannot be late', stress: 5, mindset: 1, why: 'A challenge appraisal: "It\'s hard, but I can cope."' } // W8-Liv 17
        ] }
    ] },
    // Concept: social comparison as a threat trigger.
    { id: 'hallway', act: 3, bg: 'hallway', prop: 'thought',
      text: 'You overhear classmates talking about a topic you do not recognize.',
      choices: [
        { label: 'Listen in', stress: 10, auto: true, brain: 'amygdala', why: 'Comparing yourself to others can become a threat: "I must be doing something wrong".' }, // W8-Liv 23
        { label: 'Ask them to explain it quickly', stress: 10, why: 'You might learn it, but you invite more comparison.' }, // W8-Liv 23
        { label: 'Headphones in, eyes closed', stress: -5, kind: 'calm', why: 'Bottom-up (body) regulation calms the stress response.' }, // W8-LB 38
        { label: 'Pretend you didn\'t even hear them', stress: -25, kind: 'disengage', why: 'Dismissing the threat lowers stress, and your engagement with it.' } // W12 5; W8-LB 34
      ] },
    // Concept: reframing the body's response; the amygdala does not respond to logic.
    { id: 'walkingIn', act: 3, bg: 'hallway', prop: 'thought',
      text: 'Walking in. Your heart is pounding.',
      choices: [
        { label: 'Tell yourself to calm down', stress: 5, auto: true, brain: 'amygdala', why: 'Don\'t explain to the amygdala: it does not understand logic.' }, // W8-LB 47, 49
        { label: '"Okay, my body\'s getting ready"', mindset: 1, why: 'Reframing the body\'s reaction: arousal is not necessarily panic, it is mobilized resources (Yeager et al., 2022).' }, // W8-Liv 22
        { label: 'Shake out your hands and shoulders', stress: -10, kind: 'calm', why: 'Use physiological input to calm the amygdala.' }, // W8-LB 49
        { label: '"Why can I not handle exams"', mindset: -1, stress: 5, why: 'A threat appraisal: "It\'s hard, I can\'t handle this."' } // W8-Liv 17
      ] },
    // Concept: over-arousal; affect labelling.
    { id: 'bathroom', act: 3, if: function (s) { return s.stress > 75; }, bg: 'bathroom', prop: 'phone',
      text: 'The bathroom. Two minutes before the start. You are panicking.',
      choices: [
        { label: 'Scroll your phone', stress: -5, auto: true, kind: 'disengage', why: 'Scrolling distracts, but does little to calm the body.' }, // W12 5
        { label: 'Consider all the ways this exam could go poorly', stress: 10, mindset: -1, why: 'Worry is thinking about negative things that might happen, and a stress-is-debilitating mindset feeds more stress.' }, // W8-LB 48; W8-Liv 20
        { label: 'Breathe out slower than you breathe in', stress: -15, kind: 'calm', brain: 'amygdala', why: 'Deep breathing shifts you from the sympathetic to the parasympathetic system.' }, // W8-LB 49
        { label: 'Text a friend "I\'m freaking out"', stress: -10, kind: 'calm', brain: 'amygdala', why: 'Name it to tame it: affect labelling reduces the amygdala\'s response (Lieberman et al., 2007).' } // W8-Liv 25; W8-LB 51
      ] },
    // Concept: exam pace; staying in the window.
    { id: 'easy', act: 3, bg: 'examhall', prop: 'exam', question: 'q1',
      text: 'The exam starts. Question 1 looks easy.',
      choices: [
        { label: 'Speed through to bank time', stress: 5, auto: true, why: 'Time does not predict grade.' }, // W8-Liv 24
        { label: 'Pace yourself. It isn\'t a race', stress: -5, kind: 'calm', why: '"Time does not predict grade. As long as I finish on time, I\'m good!"' }, // W8-Liv 24
        { label: 'Double-check it, seems too easy', stress: 5, why: 'Doubting an easy question spends calm you will need later.' }, // W8-LB 48
        { label: 'Flip through the whole exam first', stress: 10, mindset: 1, why: 'Understanding the task first is metacognition, though seeing it all at once is stressful.' } // W5-Met 26
      ] },
    // Concept: cortisol impairs retrieval from long-term memory.
    { id: 'blank', act: 3, bg: 'examhall', prop: 'exam', question: 'q2', blur: true,
      text: 'Question 2. You read it twice. Nothing.',
      choices: [
        { label: 'Reread it. Again. And again.', stress: 10, auto: true, brain: 'hippocampus', why: 'Stress hormones (glucocorticoids) impair retrieval from long-term memory.' }, // W8-LB 31
        { label: 'Skip it, come back later', skip: true, why: 'Noticing you\'re stuck is online metacognitive knowledge; moving on is metacognitive control.' }, // W5-Met 10; W7 28
        { label: 'Breathe out slowly, reread once', stress: -15, kind: 'calm', brain: 'amygdala', why: 'Deep breathing shifts you from the sympathetic to the parasympathetic system.' }, // W8-LB 49
        { label: '"I\'m so stupid how am I already failing"', stress: 10, mindset: -1, brain: 'amygdala', why: 'Struggles are not signs of low ability (growth mindset). This thought treats them as if they are.' } // W8-Liv 22; W8-LB 39
      ] },
    // Concept: exam pace; social comparison.
    { id: 'leaving', act: 3, bg: 'examhall', prop: 'exam', question: 'q3',
      text: 'People start leaving early.',
      choices: [
        { label: 'You must be behind. Speed up', stress: 10, mindset: -1, auto: true, why: '"Everyone is finishing faster than me. I must be doing something wrong..." is a stress-is-debilitating mindset.' }, // W8-Liv 23
        { label: 'Keep your pace, speed isn\'t marks', mindset: 1, brain: 'pfc', why: '"Time does not predict grade. As long as I finish on time, I\'m good!"' }, // W8-Liv 24
        { label: '"Oh no. I\'m for sure failing"', stress: 10, mindset: -1, why: '"This anxiety is going to ruin my performance" feeds the stress loop.' }, // W8-Liv 20, 23
        { label: 'Sip of water, reset', stress: -5, kind: 'calm', why: 'Physiological regulation reduces limbic fear and anxiety.' } // W8-LB 48
      ] },
    // Concept: online metacognition.
    { id: 'fiveMin', act: 3, bg: 'examhall', prop: 'exam', question: 'q4',
      text: 'Five minutes left. One more question.',
      choices: [
        { label: 'Double check your work', why: 'Checking your answers is online metacognitive control: monitoring and correcting your mistakes.' }, // W5-Met 24, 26
        { label: 'Go back to the one you skipped', reopen: true, brain: 'pfc', why: 'Knowing which question you left is online metacognitive knowledge. (Only possible below 70 stress.)' }, // W5-Met 10
        { label: 'Rush back through all the questions to look at every answer again', stress: 10, auto: true, why: 'Your attention is limited. Spreading it over every answer at once leaves little for any of them.' }, // W6-Att 17
        { label: 'Hand it in early, you\'re done', stress: -20, kind: 'disengage', why: 'Relief now, but you give up the time you had left.' } // W12 5; W8-LB 34
      ] },

    // ---------- Act 4: After ----------
    // Concept: reappraisal; growth mindset.
    { id: 'grade', act: 4, bg: 'bedroomDay', prop: 'grade',
      text: 'The grade comes back.',
      choices: [
        { label: 'Close the tab, don\'t look closer', stress: -10, auto: true, kind: 'disengage', why: '"Focus, assess and reflect on the process, more than the product." Closing the tab skips that.' }, // W12 33
        { label: 'Compare grades with friends', stress: 10, mindset: -1, why: 'Comparing yourself to others can become a threat.' }, // W8-Liv 23
        { label: 'Check which ones you missed and why', mindset: 1, stress: 5, brain: 'pfc', why: 'A challenge mindset brings an "increased desire for feedback (crucial for learning!)".' }, // W8-Liv 19
        { label: 'Check the score and nothing else', stress: -5, kind: 'disengage', why: 'Just the number tells you the product, not the process.' } // W12 33
      ] },
    { id: 'final', act: 4, type: 'ending', bg: 'walk' }
  ],

  // Kept by the team (2026-11-27). Source: W8-LB 33, 34 (arousal sweet spot; stress and apathy zones).
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
  // Kept by the team. Sources: W8-Liv 9; W8-LB 17, 31, 34.
  endingBrain: 'Moderate stress keeps the prefrontal cortex and hippocampus working. Too much, and stress hormones block recall; too little, and nothing pushes you to engage.',
  takeaways: [
    'Plan: turn "the midterm" into blocks of time and a list of topics.', // W5-Met 26
    'Test yourself instead of rereading. If it feels hard, it is working.', // W4 19, 20
    'Sleep before the exam instead of cramming all night.', // W2 34; W6-EF 33
    'Breathe out slower than you breathe in.', // W8-LB 49
    'Racing heart? "My body is getting ready."', // W8-Liv 22
    'Name the feeling: "Okay, I\'m panicking."', // W8-Liv 25; W8-LB 51
    'Keep your own pace. Speed isn\'t marks.' // W8-Liv 24
  ],
  // Kept by the team. Source: W8-Liv 11, 19 (stress mindset widens or narrows the window).
  epilogue: {
    wider: 'Next exam. You walk in a little more sure that stress is something you can ride. Your window is wider.',
    same: 'Next exam. Same river, same banks. You know a bit more about how to steer.',
    narrower: 'Next exam. The threat feels bigger before it starts. Your window is narrower, but windows can widen again.'
  },
  // Checked 2026-11-26: UBC's first point of contact for mental health (anxiety, feeling overwhelmed).
  wellnessUrl: 'https://students.ubc.ca/health/mental-health-care-ubc/'
};
if (typeof module !== 'undefined') module.exports = STORY;

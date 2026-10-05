import "server-only";

/**
 * Fixed question bank for the online mock tests.
 * Server-only: answer keys must never be bundled into client code.
 * To add questions, append to an exam's `questions` array with a unique `id`.
 */

export interface BankQuestion {
  id: string;
  section: string;
  passage?: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuestionBankEntry {
  durationMinutes: number;
  questionsPerPaper: number;
  questions: BankQuestion[];
}

const TRUE_FALSE_NOT_GIVEN = ["True", "False", "Not Given"];

const DATA_SUFFICIENCY_OPTIONS = [
  "Statement (1) ALONE is sufficient, but statement (2) alone is not",
  "Statement (2) ALONE is sufficient, but statement (1) alone is not",
  "BOTH statements TOGETHER are sufficient, but neither alone is",
  "EACH statement ALONE is sufficient",
  "Statements (1) and (2) TOGETHER are NOT sufficient",
];

const IELTS_PARKS_PASSAGE =
  "A 2019 study across 20 European cities found that residents living within 300 metres of a park reported lower stress levels than those living further away. However, the researchers cautioned that the effect was weaker in neighbourhoods where parks were poorly maintained, suggesting that quality matters as much as proximity.";

const IELTS_BEES_PASSAGE =
  "The honeybee communicates the location of food through the 'waggle dance'. The angle of the dance relative to vertical indicates the direction of the food in relation to the sun, while the duration of the waggle run signals how far away it is.";

const TOEFL_TECTONICS_PASSAGE =
  "Plate tectonics theory holds that Earth's lithosphere is divided into plates that move slowly over the asthenosphere. Where plates diverge, magma rises to form new crust, as at mid-ocean ridges. Where they converge, one plate may be forced beneath another in a process called subduction, often producing volcanoes and deep ocean trenches.";

const TOEFL_CINEMA_PASSAGE =
  "Early cinema relied on live musicians to accompany silent films. The arrival of synchronized sound in the late 1920s, popularized by 'The Jazz Singer' (1927), rapidly transformed the industry, and many theatre musicians lost their jobs within a few years.";

const PTE_MICROPLASTICS_PASSAGE =
  "Microplastics are plastic fragments smaller than 5 mm. They enter oceans through wastewater, the breakdown of larger debris and synthetic clothing fibres. Because they are so small, they are easily ingested by marine organisms and can move up the food chain.";

const OET_CASE_NOTES =
  "Patient: Mr Lee, 68. Diagnosis: Type 2 diabetes. Medication: Metformin 500 mg twice daily with meals. Allergies: Penicillin (rash). Next review: 3 months.";

const DET_COFFEE_PASSAGE =
  "Coffee is believed to have originated in Ethiopia. According to legend, a goat herder named Kaldi noticed that his goats became unusually energetic after eating the berries of a certain shrub. The drink later spread to Yemen and, from there, to the rest of the world.";

export const QUESTION_BANK: Record<string, QuestionBankEntry> = {
  ielts: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "ielts-r1", section: "Reading", passage: IELTS_PARKS_PASSAGE, prompt: "According to the passage, residents living within 300 metres of a park reported:", options: ["Higher incomes", "Lower stress levels", "Better sleep", "More social contact"], answerIndex: 1, explanation: "The passage states they 'reported lower stress levels'." },
      { id: "ielts-r2", section: "Reading", passage: IELTS_PARKS_PASSAGE, prompt: "The researchers' caution suggests that:", options: ["Parks have no effect on stress", "Park quality influences the benefit", "Only large parks reduce stress", "The study sample was too small"], answerIndex: 1, explanation: "The effect was weaker where parks were poorly maintained, so 'quality matters as much as proximity'." },
      { id: "ielts-r3", section: "Reading", passage: IELTS_PARKS_PASSAGE, prompt: "True, False or Not Given: The study was conducted in Asian cities.", options: TRUE_FALSE_NOT_GIVEN, answerIndex: 1, explanation: "The study covered 20 European cities, which contradicts the statement." },
      { id: "ielts-r4", section: "Reading", passage: IELTS_PARKS_PASSAGE, prompt: "True, False or Not Given: City park maintenance budgets increased after the study.", options: TRUE_FALSE_NOT_GIVEN, answerIndex: 2, explanation: "The passage says nothing about budgets after the study." },
      { id: "ielts-r5", section: "Reading", passage: IELTS_BEES_PASSAGE, prompt: "The duration of the waggle run indicates:", options: ["The type of flower", "The quantity of food", "The distance to the food", "The time of day"], answerIndex: 2, explanation: "The duration 'signals how far away it is'." },
      { id: "ielts-r6", section: "Reading", passage: IELTS_BEES_PASSAGE, prompt: "The direction of the food is shown in relation to:", options: ["The hive entrance", "The sun", "The wind", "Other bees"], answerIndex: 1, explanation: "The angle indicates direction 'in relation to the sun'." },
      { id: "ielts-w1", section: "Writing", prompt: "Choose the word closest in meaning to 'mitigate'.", options: ["Increase", "Lessen", "Ignore", "Predict"], answerIndex: 1, explanation: "To mitigate is to make something less severe." },
      { id: "ielts-w2", section: "Writing", prompt: "Choose the correct sentence.", options: ["The number of students have increased significantly.", "The number of students has increased significantly.", "The number of student has increased significantly.", "A number of students has increased significantly."], answerIndex: 1, explanation: "'The number' is singular and takes 'has'." },
      { id: "ielts-w3", section: "Writing", prompt: "In a Task 1 report, which verb best describes a quick, large increase?", options: ["Fluctuated", "Plateaued", "Surged", "Dipped"], answerIndex: 2, explanation: "'Surged' means rose suddenly and powerfully." },
      { id: "ielts-w4", section: "Writing", prompt: "If I ___ more time, I would travel more.", options: ["have", "had", "will have", "am having"], answerIndex: 1, explanation: "The second conditional uses the past simple: 'If I had…, I would…'." },
      { id: "ielts-w5", section: "Writing", prompt: "What is the minimum word count for IELTS Writing Task 2?", options: ["150 words", "200 words", "250 words", "300 words"], answerIndex: 2, explanation: "Task 2 requires at least 250 words; Task 1 requires 150." },
      { id: "ielts-s1", section: "Speaking", prompt: "In Speaking Part 2, how long are you expected to speak on the cue card topic?", options: ["30 seconds", "Up to 2 minutes", "5 minutes", "10 minutes"], answerIndex: 1, explanation: "You get 1 minute to prepare and speak for up to 2 minutes." },
    ],
  },

  toefl: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "toefl-r1", section: "Reading", passage: TOEFL_TECTONICS_PASSAGE, prompt: "According to the passage, new crust forms where plates:", options: ["Converge", "Diverge", "Stop moving", "Collide with continents"], answerIndex: 1, explanation: "Where plates diverge, magma rises to form new crust." },
      { id: "toefl-r2", section: "Reading", passage: TOEFL_TECTONICS_PASSAGE, prompt: "The word 'converge' in the passage is closest in meaning to:", options: ["Separate", "Come together", "Melt", "Rotate"], answerIndex: 1, explanation: "To converge is to move toward one another and meet." },
      { id: "toefl-r3", section: "Reading", passage: TOEFL_TECTONICS_PASSAGE, prompt: "According to the passage, subduction often produces:", options: ["Mid-ocean ridges", "Volcanoes and deep ocean trenches", "New continents", "Flat plains"], answerIndex: 1, explanation: "Subduction is described as 'often producing volcanoes and deep ocean trenches'." },
      { id: "toefl-r4", section: "Reading", passage: TOEFL_TECTONICS_PASSAGE, prompt: "Tectonic plates move over the:", options: ["Inner core", "Asthenosphere", "Atmosphere", "Ocean floor sediment"], answerIndex: 1, explanation: "Plates 'move slowly over the asthenosphere'." },
      { id: "toefl-r5", section: "Reading", passage: TOEFL_CINEMA_PASSAGE, prompt: "What can be inferred about theatre musicians?", options: ["They composed film soundtracks", "Demand for them declined after sound films arrived", "They opposed silent films", "They moved to Hollywood"], answerIndex: 1, explanation: "Many lost their jobs once synchronized sound arrived." },
      { id: "toefl-r6", section: "Reading", passage: TOEFL_CINEMA_PASSAGE, prompt: "Why does the author mention 'The Jazz Singer'?", options: ["As the last silent film", "As an example that popularized synchronized sound", "To criticize early cinema", "To describe a famous musician"], answerIndex: 1, explanation: "It is cited as the film that popularized synchronized sound." },
      { id: "toefl-w1", section: "Writing", prompt: "Choose the word closest in meaning to 'ubiquitous'.", options: ["Rare", "Found everywhere", "Ancient", "Expensive"], answerIndex: 1, explanation: "Ubiquitous means present everywhere." },
      { id: "toefl-w2", section: "Writing", prompt: "Neither the professor nor the students ___ aware of the schedule change.", options: ["was", "were", "is", "been"], answerIndex: 1, explanation: "With 'neither…nor', the verb agrees with the nearer subject ('students')." },
      { id: "toefl-w3", section: "Writing", prompt: "She has lived in Boston ___ 2018.", options: ["for", "since", "from", "during"], answerIndex: 1, explanation: "'Since' is used with a point in time in the present perfect." },
      { id: "toefl-w4", section: "Writing", prompt: "Scarcely had the lecture begun ___ the fire alarm rang.", options: ["than", "when", "then", "that"], answerIndex: 1, explanation: "The fixed structure is 'Scarcely… when'." },
      { id: "toefl-w5", section: "Writing", prompt: "Choose the word closest in meaning to 'tentative'.", options: ["Final", "Provisional", "Aggressive", "Detailed"], answerIndex: 1, explanation: "Tentative means not yet certain or fixed." },
      { id: "toefl-s1", section: "Speaking", prompt: "What is the score range for the TOEFL iBT total score?", options: ["0–9", "10–90", "0–120", "200–800"], answerIndex: 2, explanation: "Each of the four sections is scored 0–30, for a total of 0–120." },
    ],
  },

  pte: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "pte-r1", section: "Reading", prompt: "The committee finally reached a ___ after hours of debate.", options: ["consensus", "consent", "concession", "conscience"], answerIndex: 0, explanation: "A 'consensus' is a general agreement." },
      { id: "pte-r2", section: "Reading", prompt: "Recent research ___ that regular exercise improves memory.", options: ["suggest", "suggests", "suggesting", "suggestion"], answerIndex: 1, explanation: "'Research' is uncountable and takes a singular verb." },
      { id: "pte-r3", section: "Reading", prompt: "Re-order paragraphs: which sentence should come FIRST?", options: ["As a result, costs fell even further.", "Solar energy has become one of the fastest-growing power sources worldwide.", "This, however, was not the only factor.", "They also pointed to government subsidies."], answerIndex: 1, explanation: "It introduces the topic and contains no reference words like 'this' or 'they'." },
      { id: "pte-r4", section: "Reading", prompt: "Which word is spelled correctly?", options: ["Acommodate", "Accomodate", "Accommodate", "Acomodate"], answerIndex: 2, explanation: "'Accommodate' has a double 'c' and a double 'm'." },
      { id: "pte-r5", section: "Reading", passage: PTE_MICROPLASTICS_PASSAGE, prompt: "According to the passage, microplastics are fragments smaller than:", options: ["1 mm", "5 mm", "1 cm", "5 cm"], answerIndex: 1, explanation: "They are defined as 'smaller than 5 mm'." },
      { id: "pte-r6", section: "Reading", passage: PTE_MICROPLASTICS_PASSAGE, prompt: "Why are microplastics a concern, according to the passage?", options: ["They are expensive to remove", "They are ingested by marine life and move up the food chain", "They make sea water warmer", "They block sunlight"], answerIndex: 1, explanation: "Their small size means marine organisms ingest them and they 'move up the food chain'." },
      { id: "pte-sw1", section: "Speaking & Writing (Combined)", prompt: "Choose the correct collocation.", options: ["Do a decision", "Make a decision", "Take a decide", "Have a decision"], answerIndex: 1, explanation: "The natural collocation is 'make a decision'." },
      { id: "pte-sw2", section: "Speaking & Writing (Combined)", prompt: "By the time we arrived at the cinema, the film ___.", options: ["already starts", "has already started", "had already started", "was already start"], answerIndex: 2, explanation: "The past perfect shows an action completed before another past action." },
      { id: "pte-sw3", section: "Speaking & Writing (Combined)", prompt: "Choose the word most opposite in meaning to 'scarce'.", options: ["Rare", "Abundant", "Limited", "Expensive"], answerIndex: 1, explanation: "Scarce means in short supply; abundant means plentiful." },
      { id: "pte-sw4", section: "Speaking & Writing (Combined)", prompt: "What is the PTE Academic score scale?", options: ["0–9", "10–90", "0–120", "10–160"], answerIndex: 1, explanation: "PTE Academic is scored from 10 to 90." },
      { id: "pte-l1", section: "Listening", prompt: "In 'Write from Dictation', what are you required to do?", options: ["Summarize a lecture", "Type the sentence exactly as you hear it", "Answer a multiple-choice question", "Read a sentence aloud"], answerIndex: 1, explanation: "You hear a short sentence and type it exactly." },
      { id: "pte-l2", section: "Listening", prompt: "Choose the word that best completes: 'There was ___ traffic on the motorway this morning.'", options: ["strong", "heavy", "big", "hard"], answerIndex: 1, explanation: "The natural collocation is 'heavy traffic'." },
    ],
  },

  gre: {
    durationMinutes: 20,
    questionsPerPaper: 10,
    questions: [
      { id: "gre-v1", section: "Verbal Reasoning", prompt: "Although the critic was known for her ___ reviews, her assessment of the debut novel was surprisingly gentle.", options: ["glowing", "acerbic", "lengthy", "anonymous"], answerIndex: 1, explanation: "'Although' signals contrast with 'gentle', so the reviews were harsh: acerbic." },
      { id: "gre-v2", section: "Verbal Reasoning", prompt: "The scientist's claims remained ___: no experiment had yet confirmed them.", options: ["speculative", "irrefutable", "empirical", "conclusive"], answerIndex: 0, explanation: "Unconfirmed claims are speculative." },
      { id: "gre-v3", section: "Verbal Reasoning", prompt: "'Laconic' most nearly means:", options: ["Lazy", "Using very few words", "Highly emotional", "Overly formal"], answerIndex: 1, explanation: "A laconic person says a lot in few words." },
      { id: "gre-v4", section: "Verbal Reasoning", prompt: "'Ephemeral' most nearly means:", options: ["Short-lived", "Heavenly", "Essential", "Mysterious"], answerIndex: 0, explanation: "Ephemeral means lasting a very short time." },
      { id: "gre-v5", section: "Verbal Reasoning", prompt: "Which word is most nearly OPPOSITE in meaning to 'prodigal'?", options: ["Wasteful", "Thrifty", "Talented", "Rebellious"], answerIndex: 1, explanation: "Prodigal means wastefully extravagant; thrifty is its opposite." },
      { id: "gre-v6", section: "Verbal Reasoning", passage: "Some historians argue that the printing press caused the Reformation. Others contend that it merely accelerated discontent that already existed within the Church.", prompt: "The second group of historians believes the printing press:", options: ["Had no effect on the Reformation", "Sped up a process already under way", "Was invented because of the Reformation", "Was the sole cause of the Reformation"], answerIndex: 1, explanation: "'Merely accelerated' existing discontent means it sped up an existing process." },
      { id: "gre-q1", section: "Quantitative Reasoning", prompt: "If 3x − 7 = 11, what is the value of x?", options: ["4", "5", "6", "18"], answerIndex: 2, explanation: "3x = 18, so x = 6." },
      { id: "gre-q2", section: "Quantitative Reasoning", prompt: "The average of 4, 8, 12 and x is 10. What is x?", options: ["10", "14", "16", "20"], answerIndex: 2, explanation: "Sum must be 40; 4 + 8 + 12 = 24, so x = 16." },
      { id: "gre-q3", section: "Quantitative Reasoning", prompt: "A $40 shirt is discounted by 25%, then by a further 10%. What is the final price?", options: ["$26", "$27", "$28", "$30"], answerIndex: 1, explanation: "$40 × 0.75 = $30; $30 × 0.90 = $27." },
      { id: "gre-q4", section: "Quantitative Reasoning", prompt: "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?", options: ["9", "10", "12", "14"], answerIndex: 1, explanation: "√(36 + 64) = √100 = 10." },
      { id: "gre-q5", section: "Quantitative Reasoning", prompt: "Quantity A: 2¹⁰. Quantity B: 10³.", options: ["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "The relationship cannot be determined"], answerIndex: 0, explanation: "2¹⁰ = 1024 and 10³ = 1000." },
      { id: "gre-q6", section: "Quantitative Reasoning", prompt: "Two fair coins are tossed. What is the probability that both land heads?", options: ["1/2", "1/3", "1/4", "1/8"], answerIndex: 2, explanation: "1/2 × 1/2 = 1/4." },
    ],
  },

  gmat: {
    durationMinutes: 20,
    questionsPerPaper: 10,
    questions: [
      { id: "gmat-q1", section: "Quantitative Reasoning", prompt: "A train travels 180 km in 2.5 hours. What is its average speed?", options: ["60 km/h", "68 km/h", "72 km/h", "75 km/h"], answerIndex: 2, explanation: "180 ÷ 2.5 = 72 km/h." },
      { id: "gmat-q2", section: "Quantitative Reasoning", prompt: "If x/y = 3/4 and x + y = 28, what is x?", options: ["9", "12", "16", "21"], answerIndex: 1, explanation: "x = 3k, y = 4k, 7k = 28, so k = 4 and x = 12." },
      { id: "gmat-q3", section: "Quantitative Reasoning", prompt: "What is the simple interest on ₹5,000 at 8% per year for 3 years?", options: ["₹400", "₹1,000", "₹1,200", "₹1,500"], answerIndex: 2, explanation: "5000 × 0.08 × 3 = ₹1,200." },
      { id: "gmat-q4", section: "Quantitative Reasoning", prompt: "In how many ways can 4 different books be arranged on a shelf?", options: ["4", "12", "16", "24"], answerIndex: 3, explanation: "4! = 24." },
      { id: "gmat-q5", section: "Quantitative Reasoning", prompt: "If n is an even integer, which of the following must be odd?", options: ["2n", "n²", "n + 1", "n + 2"], answerIndex: 2, explanation: "An even number plus 1 is always odd." },
      { id: "gmat-v1", section: "Verbal Reasoning", passage: "Sales of Brand X umbrellas rose 40% last quarter. The manager concludes that the new advertising campaign caused the increase.", prompt: "Which of the following, if true, most weakens the manager's conclusion?", options: ["The campaign ran on social media", "The region had record rainfall last quarter", "Brand X also sells raincoats", "Competitors raised their prices slightly"], answerIndex: 1, explanation: "Record rainfall is an alternative cause for higher umbrella sales." },
      { id: "gmat-v2", section: "Verbal Reasoning", passage: "A café should extend its opening hours to 11 pm, because more customers will visit and its profits will therefore increase.", prompt: "The argument assumes that:", options: ["Competitors close earlier", "Revenue from the extra hours will exceed the additional operating costs", "Customers prefer evening visits", "Staff want to work late"], answerIndex: 1, explanation: "More customers raise profit only if extra revenue outweighs extra costs." },
      { id: "gmat-v3", section: "Verbal Reasoning", passage: "After a city installed protected bike lanes, accidents involving cyclists fell by 30%. Officials say the lanes improved cyclist safety.", prompt: "Which of the following, if true, most strengthens the officials' claim?", options: ["The number of cyclists on city roads increased over the same period", "Car sales fell during the period", "Some cyclists dislike the lanes", "The lanes were expensive to build"], answerIndex: 0, explanation: "Fewer accidents despite more cyclists rules out reduced cycling as the cause." },
      { id: "gmat-v4", section: "Verbal Reasoning", passage: "Firms that adopt remote work often report higher individual productivity. Yet several studies note that collaboration on novel problems tends to suffer when teams rarely meet in person.", prompt: "The main point of the passage is that remote work:", options: ["Should be abandoned", "Involves a trade-off between productivity and innovative collaboration", "Has no effect on productivity", "Only suits large firms"], answerIndex: 1, explanation: "The passage presents a benefit (productivity) and a cost (collaboration)." },
      { id: "gmat-d1", section: "Data Insights", prompt: "Is x > 0?\n(1) x² = 9\n(2) x³ = 27", options: DATA_SUFFICIENCY_OPTIONS, answerIndex: 1, explanation: "(1) allows x = 3 or −3; (2) gives x = 3 only." },
      { id: "gmat-d2", section: "Data Insights", prompt: "A company's revenue was $50M in 2022 and $60M in 2023. What was the percentage increase?", options: ["10%", "16.7%", "20%", "25%"], answerIndex: 2, explanation: "(60 − 50) ÷ 50 = 20%." },
      { id: "gmat-d3", section: "Data Insights", prompt: "What is the value of y?\n(1) 2y + 3 = 11\n(2) y² = 16", options: DATA_SUFFICIENCY_OPTIONS, answerIndex: 0, explanation: "(1) gives y = 4; (2) allows y = 4 or −4." },
    ],
  },

  nclex: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "nclex-s1", section: "Safe and Effective Care Environment", prompt: "Using the ABCs, which client should the nurse assess FIRST?", options: ["A client reporting pain of 6/10 after surgery", "A client with new stridor after a thyroidectomy", "A client requesting discharge information", "A client with a blood glucose of 180 mg/dL"], answerIndex: 1, explanation: "Stridor signals airway compromise, the top priority." },
      { id: "nclex-s2", section: "Safe and Effective Care Environment", prompt: "What is the single most effective way to prevent the spread of infection in hospitals?", options: ["Wearing a mask at all times", "Hand hygiene", "Prophylactic antibiotics", "Isolating every client"], answerIndex: 1, explanation: "Hand hygiene is the most effective infection-control measure." },
      { id: "nclex-s3", section: "Safe and Effective Care Environment", prompt: "A client has Clostridioides difficile. Which precautions should the nurse implement?", options: ["Airborne", "Droplet", "Contact", "Standard only"], answerIndex: 2, explanation: "C. difficile requires contact precautions and soap-and-water handwashing." },
      { id: "nclex-s4", section: "Safe and Effective Care Environment", prompt: "A client with active pulmonary tuberculosis requires which precautions?", options: ["Contact, with a gown", "Droplet, with a surgical mask", "Airborne, with an N95 respirator", "Standard only"], answerIndex: 2, explanation: "TB is airborne; staff wear an N95 and the client uses a negative-pressure room." },
      { id: "nclex-s5", section: "Safe and Effective Care Environment", prompt: "Which task can the RN delegate to an unlicensed assistive personnel (UAP)?", options: ["Assessing a new admission", "Measuring vital signs of a stable client", "Teaching insulin self-injection", "Evaluating a client's pain response"], answerIndex: 1, explanation: "Routine tasks on stable clients can be delegated; assessment, teaching and evaluation cannot." },
      { id: "nclex-p1", section: "Physiological Integrity", prompt: "What is the normal serum potassium range for an adult?", options: ["2.5–3.5 mEq/L", "3.5–5.0 mEq/L", "5.0–6.5 mEq/L", "135–145 mEq/L"], answerIndex: 1, explanation: "Normal potassium is 3.5–5.0 mEq/L (135–145 is sodium)." },
      { id: "nclex-p2", section: "Physiological Integrity", prompt: "Before giving digoxin to an adult, the nurse should withhold the dose if the apical pulse is below:", options: ["50 bpm", "60 bpm", "70 bpm", "80 bpm"], answerIndex: 1, explanation: "Hold digoxin for an adult apical pulse below 60 bpm." },
      { id: "nclex-p3", section: "Physiological Integrity", prompt: "Which finding suggests hypoglycaemia?", options: ["Hot, dry skin", "Fruity breath", "Shakiness and diaphoresis", "Polyuria"], answerIndex: 2, explanation: "Hypoglycaemia causes sympathetic signs such as shakiness and sweating." },
      { id: "nclex-p4", section: "Physiological Integrity", prompt: "What is the antidote for heparin overdose?", options: ["Vitamin K", "Protamine sulfate", "Naloxone", "Flumazenil"], answerIndex: 1, explanation: "Protamine sulfate reverses heparin; vitamin K reverses warfarin." },
      { id: "nclex-p5", section: "Physiological Integrity", prompt: "What is the reversal agent for warfarin?", options: ["Vitamin K", "Protamine sulfate", "Atropine", "Acetylcysteine"], answerIndex: 0, explanation: "Vitamin K restores clotting factor synthesis." },
      { id: "nclex-ps1", section: "Psychosocial Integrity", prompt: "A client says, 'I'm scared about my surgery tomorrow.' Which response is most therapeutic?", options: ["\"Don't worry, everything will be fine.\"", "\"Tell me more about what is worrying you.\"", "\"Your surgeon is very experienced.\"", "\"Why are you scared?\""], answerIndex: 1, explanation: "An open-ended prompt encourages the client to express feelings." },
      { id: "nclex-h1", section: "Health Promotion and Maintenance", prompt: "To reduce the risk of sudden infant death syndrome (SIDS), infants should be placed to sleep:", options: ["On their stomach", "On their side", "On their back", "Propped up on pillows"], answerIndex: 2, explanation: "Back-to-sleep positioning reduces SIDS risk." },
    ],
  },

  plab: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "plab-1a", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "What is the first-line treatment for anaphylaxis in an adult?", options: ["IV chlorphenamine", "IM adrenaline 500 micrograms (0.5 mL of 1:1000)", "Oral prednisolone", "Nebulised salbutamol"], answerIndex: 1, explanation: "IM adrenaline is first-line; antihistamines and steroids are adjuncts." },
      { id: "plab-1b", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "A patient presents with suspected acute myocardial infarction. Which drug should be given immediately?", options: ["Aspirin 300 mg", "Paracetamol 1 g", "Warfarin 5 mg", "Ibuprofen 400 mg"], answerIndex: 0, explanation: "A 300 mg aspirin loading dose is given as soon as possible." },
      { id: "plab-1c", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "What is the first-line fluid for resuscitation in diabetic ketoacidosis?", options: ["5% dextrose", "0.9% sodium chloride", "Hartmann's with glucose", "Albumin 4.5%"], answerIndex: 1, explanation: "UK DKA guidelines use 0.9% sodium chloride for initial resuscitation." },
      { id: "plab-1d", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "What is the most common cause of community-acquired pneumonia?", options: ["Staphylococcus aureus", "Streptococcus pneumoniae", "Legionella pneumophila", "Pseudomonas aeruginosa"], answerIndex: 1, explanation: "Streptococcus pneumoniae is the most common cause." },
      { id: "plab-1e", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "Which blood results are typical of primary hypothyroidism?", options: ["Low TSH, high free T4", "High TSH, low free T4", "Low TSH, low free T4", "Normal TSH, high free T4"], answerIndex: 1, explanation: "A failing thyroid lowers T4, so the pituitary raises TSH." },
      { id: "plab-1f", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "What is the maximum score on the Glasgow Coma Scale?", options: ["10", "12", "15", "20"], answerIndex: 2, explanation: "GCS ranges from 3 to 15." },
      { id: "plab-1g", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "A woman with 6 weeks of amenorrhoea presents with unilateral pelvic pain and vaginal spotting. What is the most likely diagnosis?", options: ["Ovarian cyst", "Ectopic pregnancy", "Urinary tract infection", "Endometriosis"], answerIndex: 1, explanation: "Amenorrhoea, unilateral pain and bleeding suggest ectopic pregnancy until proven otherwise." },
      { id: "plab-1h", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "A GP suspects meningococcal disease with a non-blanching rash. What should be given before urgent transfer?", options: ["Oral amoxicillin", "IM or IV benzylpenicillin", "IV paracetamol", "Nothing until hospital"], answerIndex: 1, explanation: "Give benzylpenicillin pre-hospital unless it would delay transfer." },
      { id: "plab-1i", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "Which investigation is used to confirm a suspected proximal DVT?", options: ["D-dimer alone", "Compression ultrasound of the leg veins", "Chest X-ray", "ECG"], answerIndex: 1, explanation: "Proximal leg vein ultrasound confirms DVT; D-dimer only helps rule it out." },
      { id: "plab-1j", section: "PLAB 1 (Applied Knowledge Test - AKT)", prompt: "Which ECG finding is characteristic of hypokalaemia?", options: ["Tall tented T waves", "U waves", "Delta waves", "ST elevation in all leads"], answerIndex: 1, explanation: "Hypokalaemia causes U waves and flattened T waves; tented T waves suggest hyperkalaemia." },
      { id: "plab-2a", section: "PLAB 2 (Clinical & Communication Skills - CPSA)", prompt: "Under the Mental Capacity Act 2005, which is NOT required for a patient to have capacity?", options: ["Understand the information", "Retain the information", "Agree with the doctor's recommendation", "Communicate their decision"], answerIndex: 2, explanation: "Patients with capacity may make unwise decisions; agreement is not required." },
      { id: "plab-2b", section: "PLAB 2 (Clinical & Communication Skills - CPSA)", prompt: "According to the GMC, when may a doctor disclose confidential information without consent?", options: ["When a relative asks politely", "When there is a risk of serious harm to others", "When the patient is over 65", "Never, under any circumstances"], answerIndex: 1, explanation: "Disclosure can be justified in the public interest, e.g. to prevent serious harm." },
    ],
  },

  oet: {
    durationMinutes: 15,
    questionsPerPaper: 10,
    questions: [
      { id: "oet-r1", section: "Reading (All Professions)", passage: OET_CASE_NOTES, prompt: "How often does Mr Lee take metformin?", options: ["Once daily", "Twice daily with meals", "Three times daily", "Only when needed"], answerIndex: 1, explanation: "The notes say 'twice daily with meals'." },
      { id: "oet-r2", section: "Reading (All Professions)", passage: OET_CASE_NOTES, prompt: "Which drug is Mr Lee allergic to?", options: ["Metformin", "Aspirin", "Penicillin", "Ibuprofen"], answerIndex: 2, explanation: "The allergy listed is penicillin (rash)." },
      { id: "oet-r3", section: "Reading (All Professions)", passage: "Notice to all ward staff: Hand hygiene audit training must be completed by 30 June. Staff who have not completed the training will not be rostered for ward shifts in July.", prompt: "What is the main purpose of this notice?", options: ["To announce new shift patterns", "To inform staff of a mandatory training deadline and its consequence", "To report audit results", "To invite staff to a social event"], answerIndex: 1, explanation: "It sets a deadline and explains what happens if it is missed." },
      { id: "oet-r4", section: "Reading (All Professions)", passage: "Although antibiotic stewardship programmes have reduced inappropriate prescribing, the author argues that patient expectations remain a significant barrier to further progress.", prompt: "What is the author's view?", options: ["Stewardship programmes have failed", "Patient expectations still hinder progress", "Antibiotics should never be prescribed", "Prescribing is now always appropriate"], answerIndex: 1, explanation: "The author says patient expectations 'remain a significant barrier'." },
      { id: "oet-w1", section: "Writing (Profession-Specific)", prompt: "The opening paragraph of an OET referral letter should:", options: ["List all past medical history", "State who the patient is and the purpose of the referral", "Describe the hospital's facilities", "Thank the reader for their time"], answerIndex: 1, explanation: "The reader should know the patient and purpose immediately." },
      { id: "oet-w2", section: "Writing (Profession-Specific)", prompt: "Which sentence is most appropriate for a referral letter?", options: ["Hey, can you check Mrs Patel?", "I would be grateful if you could assess Mrs Patel.", "Mrs Patel needs looking at ASAP!!", "You must see Mrs Patel."], answerIndex: 1, explanation: "OET letters require a polite, formal, professional tone." },
      { id: "oet-w3", section: "Writing (Profession-Specific)", prompt: "The patient was discharged ___ the ward on Monday.", options: ["of", "from", "off", "out"], answerIndex: 1, explanation: "The correct preposition is 'discharged from'." },
      { id: "oet-w4", section: "Writing (Profession-Specific)", prompt: "'Contraindicated' means a treatment:", options: ["Is strongly recommended", "Should not be used", "Has no side effects", "Is experimental"], answerIndex: 1, explanation: "A contraindication is a reason not to use a treatment." },
      { id: "oet-s1", section: "Speaking (Profession-Specific)", prompt: "A patient is anxious about a test result. Which response best shows empathy?", options: ["\"That's not my department.\"", "\"I can understand this must be worrying for you.\"", "\"You're overreacting.\"", "\"Just wait and see.\""], answerIndex: 1, explanation: "Acknowledging the patient's feelings is key to OET Speaking criteria." },
      { id: "oet-s2", section: "Speaking (Profession-Specific)", prompt: "How should you explain 'hypertension' to a patient in plain language?", options: ["Low blood sugar", "High blood pressure", "A fast heart rate", "Too much stress"], answerIndex: 1, explanation: "Avoid jargon: hypertension is high blood pressure." },
      { id: "oet-s3", section: "Speaking (Profession-Specific)", prompt: "'Prophylaxis' is best explained to a patient as:", options: ["Treatment to prevent a disease", "A type of surgery", "A diagnosis", "Pain relief"], answerIndex: 0, explanation: "Prophylaxis is preventive treatment." },
      { id: "oet-l1", section: "Listening (All Professions)", prompt: "Most healthcare regulators require OET Grade B. Grade B starts at which score?", options: ["250", "300", "350", "450"], answerIndex: 2, explanation: "Grade B covers scores of 350–440." },
    ],
  },

  duolingo: {
    durationMinutes: 12,
    questionsPerPaper: 10,
    questions: [
      { id: "det-a1", section: "Adaptive Test (Integrated Skills)", prompt: "Read and Select: which of these is a real English word?", options: ["Flortish", "Luminous", "Grentive", "Spolate"], answerIndex: 1, explanation: "'Luminous' means giving off light; the others are invented." },
      { id: "det-a2", section: "Adaptive Test (Integrated Skills)", prompt: "Read and Select: which of these is a real English word?", options: ["Candid", "Brasple", "Mornth", "Quessity"], answerIndex: 0, explanation: "'Candid' means honest and direct." },
      { id: "det-a3", section: "Adaptive Test (Integrated Skills)", prompt: "Complete the word: 'She was very gr___ful for the help.'", options: ["ace", "ate", "eat", "ait"], answerIndex: 1, explanation: "The word is 'grateful'." },
      { id: "det-a4", section: "Adaptive Test (Integrated Skills)", prompt: "Complete the word: 'The experiment was a compl___ success.'", options: ["ete", "eat", "ite", "ate"], answerIndex: 0, explanation: "The word is 'complete'." },
      { id: "det-a5", section: "Adaptive Test (Integrated Skills)", passage: DET_COFFEE_PASSAGE, prompt: "According to the legend, who first noticed the effect of coffee berries?", options: ["A monk", "A goat herder", "A merchant from Yemen", "A doctor"], answerIndex: 1, explanation: "A goat herder named Kaldi noticed his goats' energy." },
      { id: "det-a6", section: "Adaptive Test (Integrated Skills)", passage: DET_COFFEE_PASSAGE, prompt: "What is the best title for this passage?", options: ["How to Brew Coffee", "The Legendary Origins of Coffee", "Goats of Ethiopia", "Coffee Prices Around the World"], answerIndex: 1, explanation: "The passage is about where and how coffee is said to have originated." },
      { id: "det-a7", section: "Adaptive Test (Integrated Skills)", prompt: "He ___ to the gym every morning.", options: ["go", "goes", "going", "gone"], answerIndex: 1, explanation: "Third-person singular in the present simple takes 'goes'." },
      { id: "det-a8", section: "Adaptive Test (Integrated Skills)", prompt: "I look forward to ___ from you.", options: ["hear", "hearing", "heard", "be hearing"], answerIndex: 1, explanation: "'Look forward to' is followed by a gerund." },
      { id: "det-a9", section: "Adaptive Test (Integrated Skills)", prompt: "Choose the word closest in meaning to 'reluctant'.", options: ["Eager", "Unwilling", "Confused", "Tired"], answerIndex: 1, explanation: "Reluctant means unwilling or hesitant." },
      { id: "det-a10", section: "Adaptive Test (Integrated Skills)", prompt: "Choose the sentence that best fills the gap: 'Many cities are investing in public transport. ___ This reduces both traffic and pollution.'", options: ["Some people like cars.", "As a result, fewer people drive to work.", "Buses are often red.", "Trains were invented long ago."], answerIndex: 1, explanation: "It links investment in transport to the reduction described next." },
      { id: "det-w1", section: "Writing & Speaking Sample", prompt: "What is the Duolingo English Test score range?", options: ["0–9", "10–90", "10–160", "0–120"], answerIndex: 2, explanation: "The DET is scored from 10 to 160." },
      { id: "det-w2", section: "Writing & Speaking Sample", prompt: "How long do you have to write in the DET Writing Sample?", options: ["30 seconds", "1–2 minutes", "3–5 minutes", "20 minutes"], answerIndex: 2, explanation: "The writing sample allows 3–5 minutes." },
    ],
  },
};

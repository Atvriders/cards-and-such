import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which reptile is the largest living lizard?", choices: ["Monitor lizard", "Komodo dragon", "Iguana", "Gila monster"], correct: 1 },
  { question: "How do snakes smell?", choices: ["Nostrils", "Tongue and Jacobson's organ", "Skin receptors", "Eyes"], correct: 1 },
  { question: "Which is the largest living reptile?", choices: ["Anaconda", "Nile crocodile", "Saltwater crocodile", "Leatherback turtle"], correct: 2 },
  { question: "What is a reptile's body temperature regulation called?", choices: ["Endothermy", "Ectothermy", "Homeothermy", "Heterothermy"], correct: 1 },
  { question: "Which turtle is the largest?", choices: ["Green sea turtle", "Leatherback sea turtle", "Loggerhead", "Hawksbill"], correct: 1 },
  { question: "How do chameleons change color?", choices: ["Pigment injection", "Nanocrystal reflection in iridophore cells", "Melanin spread", "Blood flow"], correct: 1 },
  { question: "Which snake has the most potent venom?", choices: ["King cobra", "Black mamba", "Inland taipan", "Eastern diamondback"], correct: 2 },
  { question: "Which reptile has a third eye on top of its head?", choices: ["Monitor lizard", "Tuatara", "Gecko", "Iguana"], correct: 1 },
  { question: "What is a group of snakes called?", choices: ["Pack", "Pit", "Den", "Nest"], correct: 2 },
  { question: "Which gecko can walk on glass?", choices: ["Crested gecko", "Tokay gecko", "All geckos", "Leopard gecko"], correct: 2 },
  { question: "How do crocodiles care for their eggs?", choices: ["No care", "Guard nest and carry hatchlings", "Incubate with body heat", "Bury and abandon"], correct: 1 },
  { question: "Which snake is the longest in the world?", choices: ["Anaconda", "Reticulated python", "Burmese python", "King cobra"], correct: 1 },
  { question: "What is the fastest land snake?", choices: ["King cobra", "Mamba", "Black mamba", "Racer snake"], correct: 2 },
  { question: "Which reptile can regenerate its tail?", choices: ["Crocodile", "Snake", "Many lizard species", "Tortoise"], correct: 2 },
  { question: "How long can sea turtles hold their breath?", choices: ["15 minutes", "45 minutes", "Up to 7 hours when resting", "2 hours maximum"], correct: 2 },
  { question: "Which continent has no native reptiles?", choices: ["Antarctica", "Iceland", "Greenland", "All are incorrect — reptiles exist everywhere"], correct: 0 },
  { question: "What do most reptiles breathe with?", choices: ["Gills", "Skin", "Lungs", "Book lungs"], correct: 2 },
  { question: "Which reptile laid the evolutionary groundwork for birds?", choices: ["Crocodilians", "Theropod dinosaurs", "Pterosaurs", "Ancient lizards"], correct: 1 },
  { question: "Which sense do pit vipers use to detect warm prey?", choices: ["Enhanced vision", "Infrared heat pits", "Electroreception", "Magnetoreception"], correct: 1 },
  { question: "How do sea turtles navigate across oceans?", choices: ["Ocean currents only", "Earth's magnetic field", "Star navigation", "Following prey"], correct: 1 },
  { question: "What is the oldest living reptile group?", choices: ["Lizards", "Snakes", "Tuatara lineage (rhynchocephalia)", "Crocodilians"], correct: 2 },
  { question: "Which venomous lizard injects venom via grooved teeth?", choices: ["Gila monster", "Komodo dragon", "Monitor lizard", "Mexican beaded lizard"], correct: 0 },
  { question: "How do tortoises differ from turtles?", choices: ["Tortoises are marine", "Tortoises are land-dwelling with domed shells", "No difference", "Turtles have legs not flippers"], correct: 1 },
  { question: "Which snake uses constriction to kill prey?", choices: ["Cobra", "Boa constrictor", "Rattlesnake", "Mamba"], correct: 1 },
  { question: "What is the purpose of a rattlesnake's rattle?", choices: ["Attract mates", "Warn predators", "Communicate with other snakes", "Help balance"], correct: 1 },
  { question: "Which reptile has the strongest bite force relative to size?", choices: ["Alligator snapping turtle", "Nile crocodile", "Komodo dragon", "Saltwater crocodile"], correct: 0 },
  { question: "How do reptile eggs differ from amphibian eggs?", choices: ["Reptile eggs have a leathery shell", "Amphibian eggs have shells", "No difference", "Reptile eggs need water"], correct: 0 },
  { question: "What is the collective term for scales on a snake's belly?", choices: ["Scutes (ventral scales)", "Plates", "Shields", "Laminae"], correct: 0 },
  { question: "How do Komodo dragons find prey?", choices: ["Vision only", "Forked tongue and vomeronasal organ", "Hearing", "Echolocation"], correct: 1 },
  { question: "Which reptile can detach its own tail to escape predators?", choices: ["All lizards", "Many lizard species (autotomy)", "Geckos only", "Skinks only"], correct: 1 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": if (state.submitted) return state; return { ...state, selected: action.choice };
    case "submit": { if (state.submitted || state.selected === null) return state; const q = state.questions[state.currentIndex]!; const ok = state.selected === q.correct; return { ...state, submitted: true, score: state.score + (ok ? 100 + Math.floor(state.timeLeft * 10) : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" }; }
    case "tick": { if (state.submitted) return state; const t = state.timeLeft - 1; if (t <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" }; return { ...state, timeLeft: t }; }
    case "next": { const n = state.currentIndex + 1; if (n >= state.questions.length) return { ...state, phase: "done" }; return { ...state, currentIndex: n, selected: null, submitted: false, timeLeft: 15, phase: "playing" }; }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

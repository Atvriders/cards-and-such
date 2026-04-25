import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest mammal on Earth?", choices: ["African elephant", "Blue whale", "Sperm whale", "Giraffe"], correct: 1 },
  { question: "Which mammal can fly?", choices: ["Flying squirrel", "Sugar glider", "Bat", "Colugo"], correct: 2 },
  { question: "What defines a mammal?", choices: ["Lays eggs", "Warm-blooded with fur/hair and nurses young", "Has scales", "Has four legs"], correct: 1 },
  { question: "Which mammal has the longest gestation period?", choices: ["Elephant (22 months)", "Sperm whale", "Orca", "Rhinoceros"], correct: 0 },
  { question: "What is the only egg-laying mammal?", choices: ["Platypus only", "Echidna only", "Platypus and echidna (monotremes)", "Opossum"], correct: 2 },
  { question: "Which mammal has the highest blood pressure?", choices: ["Elephant", "Giraffe", "Blue whale", "Cheetah"], correct: 1 },
  { question: "Which mammal has the most teeth?", choices: ["Human", "Long-snouted spinner dolphin", "Giant armadillo", "Opossum"], correct: 1 },
  { question: "What is a group of lions called?", choices: ["Pack", "Pod", "Pride", "Herd"], correct: 2 },
  { question: "How long can a sperm whale hold its breath?", choices: ["30 minutes", "60 minutes", "90 minutes", "Over 2 hours"], correct: 2 },
  { question: "Which mammal has the thickest fur?", choices: ["Polar bear", "Arctic fox", "Sea otter", "Musk ox"], correct: 2 },
  { question: "What is echolocation mainly used by?", choices: ["Bats and dolphins", "Whales only", "Bats only", "All marine mammals"], correct: 0 },
  { question: "Which mammal is the fastest on land?", choices: ["Lion", "Pronghorn antelope", "Cheetah", "Springbok"], correct: 2 },
  { question: "What do marsupials have that other mammals lack?", choices: ["Fur", "Warm blood", "A pouch for young", "Live birth"], correct: 2 },
  { question: "Which primate is most closely related to humans?", choices: ["Gorilla", "Chimpanzee", "Bonobo", "Orangutan"], correct: 1 },
  { question: "How do dolphins communicate?", choices: ["Only visual signals", "Clicks, whistles, and echolocation", "Pheromones", "Touch only"], correct: 1 },
  { question: "Which is the smallest mammal by mass?", choices: ["Etruscan shrew", "Bumblebee bat", "Pygmy mouse", "Least weasel"], correct: 0 },
  { question: "What is a baby whale called?", choices: ["Pup", "Calf", "Foal", "Kit"], correct: 1 },
  { question: "Which mammal sleeps the most each day?", choices: ["Sloth (20h)", "Koala (22h)", "Big brown bat (20h)", "Armadillo (18h)"], correct: 1 },
  { question: "Which mammal has fingerprints almost identical to humans?", choices: ["Gorilla", "Chimpanzee", "Koala", "Orangutan"], correct: 2 },
  { question: "How do elephants communicate over long distances?", choices: ["Visual signals", "Infrasound rumbles", "Chemical signals", "Ultrasound"], correct: 1 },
  { question: "Which mammal has the strongest bite force?", choices: ["Tiger", "Hippopotamus", "Spotted hyena", "Saltwater crocodile"], correct: 1 },
  { question: "What is special about a platypus bill?", choices: ["Detects infrared", "Detects electrical fields", "Used for digging only", "Venomous"], correct: 1 },
  { question: "Which mammal is considered the most dangerous to humans in Africa?", choices: ["Lion", "Hippopotamus", "Cape buffalo", "Nile crocodile"], correct: 1 },
  { question: "How many chambers does a mammal heart have?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Which mammal has the longest tongue relative to body size?", choices: ["Anteater", "Pangolin", "Tube-lipped nectar bat", "Sun bear"], correct: 2 },
  { question: "What is a group of wolves called?", choices: ["Pride", "Pack", "Herd", "Coalition"], correct: 1 },
  { question: "Which mammal has the most powerful sense of smell?", choices: ["Dog", "Bear", "Elephant", "Pig"], correct: 1 },
  { question: "What is the primary diet of giant pandas?", choices: ["Fish", "Bamboo", "Insects", "Fruit"], correct: 1 },
  { question: "Which mammal is the only one with a truly prehensile tail in the Americas?", choices: ["Kinkajou", "Coati", "Virginia opossum", "Spider monkey"], correct: 3 },
  { question: "How many pairs of nipples does a domestic pig have on average?", choices: ["4", "7", "6–7", "10"], correct: 2 },
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

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the longest river in the world?", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
  { question: "Which river has the largest volume of water flow?", choices: ["Nile", "Amazon", "Congo", "Yangtze"], correct: 1 },
  { question: "What is the source of the Nile River?", choices: ["Lake Tanganyika", "Lake Victoria", "White Nile springs (Burundi)", "Blue Nile (Ethiopia)"], correct: 2 },
  { question: "What is the Amazon River's main characteristic?", choices: ["Longest river", "Greatest discharge — 20% of world's freshwater", "Fastest current", "Deepest river"], correct: 1 },
  { question: "Which river flows through the most countries?", choices: ["Danube (10)", "Nile (11)", "Amazon (9)", "Rhine (6)"], correct: 0 },
  { question: "What is a river delta?", choices: ["Start of a river", "Fan-shaped deposit at a river's mouth", "Waterfall", "River bend"], correct: 1 },
  { question: "Which is the deepest river in the world?", choices: ["Amazon", "Congo River", "Yangtze", "Mississippi"], correct: 1 },
  { question: "What is the source of a river called?", choices: ["Mouth", "Delta", "Headwaters / source", "Tributary"], correct: 2 },
  { question: "What is a tributary?", choices: ["Main river", "A stream feeding into a larger river", "River delta", "Meander loop"], correct: 1 },
  { question: "Which river is sacred in Hinduism?", choices: ["Indus", "Brahmaputra", "Ganges (Ganga)", "Yamuna"], correct: 2 },
  { question: "What is the Yangtze River famous for?", choices: ["Longest in Africa", "Longest in Asia and Three Gorges Dam", "Most tributaries", "Highest elevation"], correct: 1 },
  { question: "What is a meander?", choices: ["Waterfall", "Curved bend in a river", "Narrow gorge", "Floodplain"], correct: 1 },
  { question: "Which river drains into the Bay of Bengal?", choices: ["Indus", "Ganges-Brahmaputra", "Irrawaddy", "All of the above"], correct: 3 },
  { question: "What is the Mississippi-Missouri system notable for?", choices: ["Shortest major river system", "Fourth-longest river system in the world", "Deepest gorge", "Fastest current"], correct: 1 },
  { question: "What is a floodplain?", choices: ["Dam reservoir", "Flat land adjacent to river liable to flooding", "River source area", "Tidal estuary"], correct: 1 },
  { question: "Which river separates India and Pakistan?", choices: ["Ganges", "Indus", "Brahmaputra", "Chenab"], correct: 1 },
  { question: "What is the Volga River's significance?", choices: ["Longest in Asia", "Longest river in Europe", "Most polluted river", "River with most dams"], correct: 1 },
  { question: "Which river runs through Egypt and is vital to its civilization?", choices: ["Niger", "Congo", "Nile", "Zambezi"], correct: 2 },
  { question: "What is an oxbow lake?", choices: ["Lake at river source", "U-shaped lake formed from river meander", "Reservoir", "Crater lake"], correct: 1 },
  { question: "Which is the shortest river officially recognized?", choices: ["Roe River (USA)", "D River (USA)", "Reprua River (Georgia)", "Cranberry Creek"], correct: 0 },
  { question: "What is the role of rivers in the water cycle?", choices: ["Store water permanently", "Transport water from land to sea", "Create rain", "Filter salt"], correct: 1 },
  { question: "Which river has Victoria Falls?", choices: ["Zambezi", "Congo", "Niger", "Orange"], correct: 0 },
  { question: "What is a watershed?", choices: ["River mouth", "Land area draining into a river", "Dry riverbed", "Tidal zone"], correct: 1 },
  { question: "Which river runs through London?", choices: ["Severn", "Thames", "Avon", "Trent"], correct: 1 },
  { question: "What are the two Nile tributaries?", choices: ["White Nile and Blue Nile", "Upper and Lower Nile", "Nile and Congo", "Niger and Nile"], correct: 0 },
  { question: "Which river is the life blood of Mesopotamia?", choices: ["Indus and Ganges", "Tigris and Euphrates", "Nile and Congo", "Yangtze and Yellow"], correct: 1 },
  { question: "What is the Niger River important for?", choices: ["Longest river in Africa", "Supports West African farming and commerce", "Deepest African river", "Most tributaries in Africa"], correct: 1 },
  { question: "What is an estuary?", choices: ["Lake at river mouth", "Tidal mouth where river meets sea", "Waterfall zone", "Desert riverbed"], correct: 1 },
  { question: "What percentage of world's freshwater do rivers hold?", choices: ["Less than 0.5%", "5%", "10%", "20%"], correct: 0 },
  { question: "Which river flows through Paris?", choices: ["Loire", "Rhine", "Seine", "Rhône"], correct: 2 },
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

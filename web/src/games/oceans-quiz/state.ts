import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What percentage of Earth's surface is covered by oceans?", choices: ["61%", "71%", "81%", "65%"], correct: 1 },
  { question: "What is the deepest point in the ocean?", choices: ["Tonga Trench", "Mariana Trench (Challenger Deep)", "Puerto Rico Trench", "Java Trench"], correct: 1 },
  { question: "How deep is the Mariana Trench?", choices: ["6,000 m", "8,000 m", "~11,000 m", "9,500 m"], correct: 2 },
  { question: "What drives ocean surface currents?", choices: ["Moon's gravity", "Wind", "Earth's rotation", "Wind + rotation together"], correct: 3 },
  { question: "What is the thermohaline circulation?", choices: ["Surface current system", "Deep ocean circulation driven by temp & salinity", "Tidal current", "Wind-driven upwelling"], correct: 1 },
  { question: "Which ocean is the largest?", choices: ["Atlantic", "Indian", "Pacific", "Southern"], correct: 2 },
  { question: "What is the average salinity of ocean water?", choices: ["1.5%", "2.5%", "3.5%", "4.5%"], correct: 2 },
  { question: "What causes ocean tides?", choices: ["Sun's heat", "Moon's gravitational pull", "Wind", "Earth's rotation alone"], correct: 1 },
  { question: "What is the photic zone?", choices: ["Deep-sea zone with no light", "Zone where sunlight penetrates for photosynthesis", "Transition zone", "Zone of hydrothermal vents"], correct: 1 },
  { question: "What produces most of Earth's oxygen?", choices: ["Rainforests", "Phytoplankton in oceans", "Grass", "Algae in rivers"], correct: 1 },
  { question: "What is a gyre?", choices: ["Underwater mountain", "Large rotating ocean current", "Deep-sea trench", "Tidal bore"], correct: 1 },
  { question: "What is the Great Pacific Garbage Patch?", choices: ["Coral reef zone", "Area of concentrated ocean plastic debris", "Natural kelp forest", "Volcanic seamount"], correct: 1 },
  { question: "Which ocean current keeps Western Europe relatively warm?", choices: ["California Current", "Humboldt Current", "Gulf Stream", "Labrador Current"], correct: 2 },
  { question: "What is bioluminescence in the ocean?", choices: ["Reflection of moonlight", "Light produced by living organisms", "Phosphorescent minerals", "Reflected sunlight"], correct: 1 },
  { question: "What percentage of the ocean floor has been mapped in detail?", choices: ["~20%", "~60%", "~80%", "100%"], correct: 0 },
  { question: "What is a tsunami caused by?", choices: ["Storm winds", "Submarine earthquakes or landslides", "Tidal forces", "Volcanic eruptions above water"], correct: 1 },
  { question: "Which is the saltiest major ocean?", choices: ["Pacific", "Indian", "Atlantic", "Arctic"], correct: 2 },
  { question: "What are hydrothermal vents?", choices: ["Underwater volcanoes", "Cracks releasing hot mineral-rich water", "Cold seep areas", "Submarine geysers"], correct: 1 },
  { question: "Which ocean has the most islands?", choices: ["Atlantic", "Indian", "Pacific", "Southern"], correct: 2 },
  { question: "What is El Niño?", choices: ["Atlantic storm system", "Periodic warming of Pacific surface water", "Cold Pacific current", "Monsoon pattern"], correct: 1 },
  { question: "How do coral reefs form?", choices: ["Volcanic rock accumulation", "Calcium carbonate skeletons of coral polyps", "Limestone erosion", "Sediment deposition"], correct: 1 },
  { question: "What is the role of kelp forests?", choices: ["None — just plants", "Provide habitat, food, and oxygen", "Block currents", "Reduce salinity"], correct: 1 },
  { question: "Which zone is completely dark in the ocean?", choices: ["Mesopelagic", "Bathypelagic", "Abyssopelagic and hadopelagic", "Epipelagic"], correct: 2 },
  { question: "What is the smallest ocean?", choices: ["Southern", "Arctic", "Indian", "Atlantic"], correct: 1 },
  { question: "How does ocean acidification occur?", choices: ["Pollution runoff", "Ocean absorbing excess CO₂", "Volcanic activity", "Salt accumulation"], correct: 1 },
  { question: "What is a seamount?", choices: ["Underwater island", "Submerged volcanic mountain", "Ocean floor plain", "Submarine canyon"], correct: 1 },
  { question: "How fast can a tsunami travel in open ocean?", choices: ["50 km/h", "150 km/h", "500–900 km/h", "1000 km/h"], correct: 2 },
  { question: "What is the ocean's dead zone?", choices: ["Deepest trenches", "Hypoxic area with little oxygen for marine life", "Polar water zone", "Abyssal plain"], correct: 1 },
  { question: "Which current is the world's largest ocean current?", choices: ["Gulf Stream", "Antarctic Circumpolar Current", "Kuroshio Current", "Equatorial Counter Current"], correct: 1 },
  { question: "What percent of marine species live in coral reefs?", choices: ["10%", "25%", "50%", "75%"], correct: 1 },
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

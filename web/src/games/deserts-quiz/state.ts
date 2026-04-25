import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface QuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is the largest hot desert in the world?", choices: ["Arabian Desert", "Gobi Desert", "Sahara Desert", "Australian Desert"], correct: 2 },
  { question: "What is the largest desert overall (including cold)?", choices: ["Sahara", "Gobi", "Antarctic Desert", "Arctic Desert"], correct: 2 },
  { question: "How is a desert defined scientifically?", choices: ["No plants grow", "Receives less than 250 mm precipitation per year", "Very hot temperatures", "Sandy terrain"], correct: 1 },
  { question: "What animal is best adapted to desert life?", choices: ["Camel", "Roadrunner", "Desert tortoise", "Fennec fox"], correct: 0 },
  { question: "How do camels store water?", choices: ["In humps (fat)", "In stomach pouches", "In specialized cells", "In bloodstream"], correct: 0 },
  { question: "What is a desert oasis?", choices: ["Sand dune", "Fertile spot with water in a desert", "Dry riverbed", "Rocky outcrop"], correct: 1 },
  { question: "Which desert is the driest on Earth?", choices: ["Sahara", "Atacama Desert", "Arabian Desert", "Namib Desert"], correct: 1 },
  { question: "What is a wadi?", choices: ["Desert sand dune", "Dry riverbed or valley", "Desert plant", "Nomadic camp"], correct: 1 },
  { question: "Which continent has the most desert area?", choices: ["Asia", "Africa", "Australia", "Antarctica"], correct: 3 },
  { question: "What is the phenomenon of a mirage?", choices: ["Water found in sand", "Optical illusion caused by hot air bending light", "Desert whirlwind", "Sandstorm"], correct: 1 },
  { question: "How do desert cacti store water?", choices: ["Roots", "Thick waxy stems", "Leaves", "Bark"], correct: 1 },
  { question: "Which desert has the highest recorded temperature?", choices: ["Sahara (Aziziyah)", "Death Valley, USA", "Lut Desert, Iran", "Arabian Desert"], correct: 2 },
  { question: "What is a haboob?", choices: ["Desert insect", "Intense sandstorm or dust storm", "Desert flower", "Nomadic trade route"], correct: 1 },
  { question: "What is the Gobi Desert's climate type?", choices: ["Hot desert", "Cold desert", "Subtropical desert", "Polar desert"], correct: 1 },
  { question: "Which desert spans North Africa across 11 countries?", choices: ["Namib", "Kalahari", "Sahara", "Arabian"], correct: 2 },
  { question: "What is an erg in desert geography?", choices: ["Rock desert", "Large area of sand dunes", "Gravel plain", "Dried lake bed"], correct: 1 },
  { question: "What is the Namib Desert famous for?", choices: ["Highest dunes on Earth", "Being oldest desert (55+ million years)", "Most life diversity", "Deepest gorges"], correct: 1 },
  { question: "How do fennec foxes survive desert heat?", choices: ["Burrow underground", "Large ears dissipate heat", "Nocturnal behavior", "All of the above"], correct: 3 },
  { question: "What is a reg (desert)?", choices: ["Gravel or stone plain", "Sand dune field", "Rock arch", "Dry riverbed"], correct: 0 },
  { question: "Which desert is in South America?", choices: ["Kalahari", "Gobi", "Atacama", "Sonoran"], correct: 2 },
  { question: "What plant is known as the desert rose?", choices: ["Cactus flower", "Barite crystal formation", "Desert marigold", "Sand verbena"], correct: 1 },
  { question: "How do desert beetles collect water in the Namib?", choices: ["Digging", "From morning fog on their backs", "Root systems", "Eating succulents"], correct: 1 },
  { question: "What is the Sonoran Desert known for?", choices: ["Highest temperatures", "Giant saguaro cacti", "Largest dunes", "Most ancient rocks"], correct: 1 },
  { question: "Which animal in Australia's desert is known for carrying water in folds of skin?", choices: ["Thorny devil", "Thorny dragon", "Australian frilled lizard", "Water-holding frog"], correct: 3 },
  { question: "What percentage of Earth's land surface is desert?", choices: ["15%", "33%", "25%", "40%"], correct: 1 },
  { question: "What is desertification?", choices: ["Creating artificial deserts", "Process of fertile land becoming desert", "Desert mapping", "Sand dune formation"], correct: 1 },
  { question: "What is a dry lake bed called in the US southwest?", choices: ["Playa", "Wadi", "Reg", "Hammada"], correct: 0 },
  { question: "Which desert bird can run at 30 km/h?", choices: ["Ostrich", "Roadrunner", "Sandgrouse", "Desert lark"], correct: 1 },
  { question: "What special adaptation do desert plants use to open stomata?", choices: ["Daytime opening", "CAM (Crassulacean acid metabolism)", "C3 pathway", "No adaptation"], correct: 1 },
  { question: "Which cold desert is in Central Asia?", choices: ["Taklamakan", "Gobi", "Karakum", "All of the above"], correct: 3 },
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

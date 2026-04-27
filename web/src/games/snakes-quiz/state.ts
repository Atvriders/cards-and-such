import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SnakesQuizSettings { questions: "10"; }
export interface SnakesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SnakesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The longest venomous snake in the world is the?", choices: ["Black Mamba", "King Cobra", "Reticulated Python", "Inland Taipan"], correct: 1 },
  { question: "Pythons kill prey by?", choices: ["Venom", "Constriction", "Biting", "Drowning"], correct: 1 },
  { question: "The most venomous snake by toxicity is?", choices: ["Black Mamba", "Cobra", "Inland Taipan", "Rattlesnake"], correct: 2 },
  { question: "Rattlesnakes are native to?", choices: ["Americas", "Africa", "Asia", "Australia"], correct: 0 },
  { question: "Cobras are famous for their?", choices: ["Hood", "Speed", "Color", "Size"], correct: 0 },
  { question: "The largest snake by weight is the?", choices: ["King Cobra", "Reticulated Python", "Green Anaconda", "Burmese Python"], correct: 2 },
  { question: "Black mambas are native to?", choices: ["Africa", "Asia", "Americas", "Australia"], correct: 0 },
  { question: "Snakes smell with their?", choices: ["Nose", "Tongue (Jacobson's organ)", "Mouth", "Skin"], correct: 1 },
  { question: "Sea snakes are most diverse in?", choices: ["Pacific and Indian oceans", "Atlantic", "Arctic", "Antarctic"], correct: 0 },
  { question: "Which snake gives live birth?", choices: ["Boas", "Pythons", "Cobras", "All snakes lay eggs"], correct: 0 },
  { question: "Vipers strike using?", choices: ["Hinged fangs", "Fixed fangs", "No fangs", "Constriction"], correct: 0 },
  { question: "The hognose snake is famous for?", choices: ["Playing dead", "Speed", "Size", "Color"], correct: 0 },
  { question: "Snakes shed their skin via process called?", choices: ["Molting", "Ecdysis", "Metamorphosis", "Sloughing"], correct: 1 },
  { question: "Coral snakes are mimicked by harmless?", choices: ["Milk snakes / kingsnakes", "Pythons", "Boas", "Vipers"], correct: 0 },
  { question: "How many ribs do most snakes have approximately?", choices: ["12", "50", "100", "200+"], correct: 3 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }

export function initialState(seed: number, _settings: SnakesQuizSettings): SnakesQuizState {
  const rng = mulberry32(seed);
  const count = 10;
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s = shuffle(idx,rng); const nc = s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: SnakesQuizState, action: SnakesQuizAction): SnakesQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: SnakesQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

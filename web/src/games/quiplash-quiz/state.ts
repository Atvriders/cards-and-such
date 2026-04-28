import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface QuiplashQuizSettings { dummy: boolean; }
export interface QuiplashQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type QuiplashQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Quiplash is developed by?", choices: ["Telltale Games", "Jackbox Games", "Hasbro", "Mattel"], correct: 1 },
  { question: "Original Quiplash released in?", choices: ["2013", "2015", "2017", "2020"], correct: 1 },
  { question: "Players type answers using?", choices: ["Their phone or tablet", "A controller", "Voice recognition", "A pen"], correct: 0 },
  { question: "Quiplash 3 introduced what final round?", choices: ["Quadlash", "Thriplash", "Thunderlash", "Heathquip"], correct: 1 },
  { question: "The original Quiplash is in which pack?", choices: ["Party Pack 2", "Party Pack 4", "Party Pack 1", "Party Pack 7"], correct: 0 },
  { question: "Quiplash 2 is in which pack?", choices: ["Party Pack 3", "Party Pack 5", "Party Pack 7", "Standalone"], correct: 0 },
  { question: "Quiplash 3 is in which pack?", choices: ["Party Pack 5", "Party Pack 7", "Party Pack 9", "Standalone"], correct: 1 },
  { question: "Each round, two players see?", choices: ["The same prompt", "Different prompts", "No prompt", "Pictures"], correct: 0 },
  { question: "After answers are submitted, players/audience?", choices: ["Vote for the funnier one", "Score themselves", "Choose nothing", "Roll dice"], correct: 0 },
  { question: "Maximum players in standard Quiplash is?", choices: ["4", "6", "8", "10"], correct: 2 },
  { question: "Quiplash audience size cap is typically?", choices: ["5", "10000", "100", "0 (no audience)"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: QuiplashQuizSettings): QuiplashQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: QuiplashQuizState, action: QuiplashQuizAction): QuiplashQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      return { ...state, submitted: true, score: state.score + (ok ? 100 : 0), correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
    }
    default: return state;
  }
}
export function isTerminal(state: QuiplashQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

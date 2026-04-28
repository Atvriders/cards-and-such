import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MonikersQuizSettings { dummy: boolean; }
export interface MonikersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MonikersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Monikers consists of how many rounds?", choices: ["Two", "Three", "Four", "Five"], correct: 1 },
  { question: "In round 2, players may use?", choices: ["Free description", "Only one word", "Only gestures", "Only sounds"], correct: 1 },
  { question: "In round 3, players may use?", choices: ["Free description", "Only one word", "Only gestures/charades", "Only sounds"], correct: 2 },
  { question: "Monikers is published by?", choices: ["CMYK Games", "Asmodee", "Mattel", "Looney Labs"], correct: 0 },
  { question: "The cards typically depict?", choices: ["Numbers", "Names of famous and weird people", "Animals", "Foods"], correct: 1 },
  { question: "Same names appear in?", choices: ["Only round 1", "All three rounds", "Random rounds", "Just round 3"], correct: 1 },
  { question: "Recommended player count is usually?", choices: ["2-3", "4-16", "20+", "exactly 5"], correct: 1 },
  { question: "Designer Alex Hague was inspired by?", choices: ["Salem", "Time's Up!", "Cranium", "Werewolf"], correct: 1 },
  { question: "Serious Nonsense is a Monikers?", choices: ["Movie", "Expansion", "Cartoon", "App"], correct: 1 },
  { question: "Round 1 of Monikers is described as?", choices: ["One word only", "Free description", "Charades", "Mute"], correct: 1 },
  { question: "The original Monikers Kickstarter funded in?", choices: ["2007", "2014", "2018", "2020"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: MonikersQuizSettings): MonikersQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: MonikersQuizState, action: MonikersQuizAction): MonikersQuizState {
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
export function isTerminal(state: MonikersQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

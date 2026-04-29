import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SynonymQuizSettings { questions: "8" | "12"; }
export interface SynonymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SynonymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "A synonym for 'happy' is:", choices: ["sad","joyful","angry","tired"], correct: 1 },
  { question: "A synonym for 'rapid' is:", choices: ["slow","quick","late","heavy"], correct: 1 },
  { question: "A synonym for 'huge' is:", choices: ["tiny","massive","narrow","brief"], correct: 1 },
  { question: "A synonym for 'begin' is:", choices: ["finish","commence","stop","leave"], correct: 1 },
  { question: "A synonym for 'brave' is:", choices: ["timid","valiant","weary","silent"], correct: 1 },
  { question: "A synonym for 'silent' is:", choices: ["loud","quiet","bright","early"], correct: 1 },
  { question: "A synonym for 'difficult' is:", choices: ["easy","arduous","light","plain"], correct: 1 },
  { question: "A synonym for 'old' is:", choices: ["young","ancient","new","fresh"], correct: 1 },
  { question: "A synonym for 'mistake' is:", choices: ["plan","error","success","lesson"], correct: 1 },
  { question: "A synonym for 'cold' is:", choices: ["hot","frigid","warm","mild"], correct: 1 },
  { question: "A synonym for 'wealthy' is:", choices: ["poor","affluent","frugal","empty"], correct: 1 },
  { question: "A synonym for 'angry' is:", choices: ["calm","furious","glad","kind"], correct: 1 },
  { question: "A synonym for 'shiny' is:", choices: ["dull","gleaming","old","drab"], correct: 1 },
  { question: "A synonym for 'tired' is:", choices: ["alert","exhausted","strong","fast"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SynonymQuizSettings): SynonymQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: SynonymQuizState, action: SynonymQuizAction): SynonymQuizState {
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
export function isTerminal(state: SynonymQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

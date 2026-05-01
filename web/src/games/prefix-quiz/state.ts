import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PrefixQuizSettings { questions: "8" | "12"; }
export interface PrefixQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PrefixQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The prefix 'pre-' means:", choices: ["after","before","again","not"], correct: 1 },
  { question: "The prefix 're-' usually means:", choices: ["before","again","not","under"], correct: 1 },
  { question: "The prefix 'un-' means:", choices: ["below","not","over","with"], correct: 1 },
  { question: "The prefix 'sub-' means:", choices: ["above","below","near","again"], correct: 1 },
  { question: "The prefix 'super-' means:", choices: ["less","above/over","apart","without"], correct: 1 },
  { question: "The prefix 'mis-' means:", choices: ["correctly","wrongly","never","early"], correct: 1 },
  { question: "The prefix 'bi-' means:", choices: ["one","two","three","ten"], correct: 1 },
  { question: "The prefix 'tri-' means:", choices: ["two","three","four","five"], correct: 1 },
  { question: "The prefix 'inter-' means:", choices: ["between","under","beyond","not"], correct: 0 },
  { question: "The prefix 'trans-' means:", choices: ["with","across","under","none"], correct: 1 },
  { question: "Which prefix would form 'unhappy'?", choices: ["pre-","un-","re-","sub-"], correct: 1 },
  { question: "Which prefix would form 'rewrite'?", choices: ["mis-","re-","pre-","un-"], correct: 1 },
  { question: "The prefix 'anti-' means:", choices: ["with","against","near","over"], correct: 1 },
  { question: "The prefix 'auto-' means:", choices: ["self","other","under","over"], correct: 0 },
  { question: "The prefix 'co-' means:", choices: ["alone","together/with","against","before"], correct: 1 },
  { question: "The prefix 'dis-' means:", choices: ["with","apart/not","beside","over"], correct: 1 },
  { question: "The prefix 'mono-' means:", choices: ["many","one","two","three"], correct: 1 },
  { question: "The prefix 'poly-' means:", choices: ["one","many","two","few"], correct: 1 },
  { question: "The prefix 'multi-' means:", choices: ["one","many","small","alone"], correct: 1 },
  { question: "The prefix 'mega-' means:", choices: ["small","large/great","few","low"], correct: 1 },
  { question: "The prefix 'micro-' means:", choices: ["large","small","fast","slow"], correct: 1 },
  { question: "The prefix 'semi-' means:", choices: ["whole","half","double","none"], correct: 1 },
  { question: "The prefix 'over-' means:", choices: ["under","above/too much","behind","alone"], correct: 1 },
  { question: "The prefix 'under-' means:", choices: ["above","below/too little","around","with"], correct: 1 },
  { question: "The prefix 'ex-' means:", choices: ["inside","out/former","over","near"], correct: 1 },
  { question: "The prefix 'in-' often means:", choices: ["with","not/into","around","above"], correct: 1 },
  { question: "The prefix 'fore-' means:", choices: ["after","before/in front","below","alone"], correct: 1 },
  { question: "The prefix 'post-' means:", choices: ["before","after","during","with"], correct: 1 },
  { question: "Which prefix would form 'biweekly'?", choices: ["pre-","bi-","tri-","uni-"], correct: 1 },
  { question: "Which prefix would form 'preview'?", choices: ["post-","pre-","re-","un-"], correct: 1 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PrefixQuizSettings): PrefixQuizState {
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
export function reducer(state: PrefixQuizState, action: PrefixQuizAction): PrefixQuizState {
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
export function isTerminal(state: PrefixQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

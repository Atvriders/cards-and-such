import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AntonymQuizSettings { questions: "8" | "12"; }
export interface AntonymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AntonymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The opposite of 'happy' is:", choices: ["joyful","sad","gleeful","content"], correct: 1 },
  { question: "The opposite of 'fast' is:", choices: ["rapid","slow","quick","brisk"], correct: 1 },
  { question: "The opposite of 'hot' is:", choices: ["warm","cold","tepid","mild"], correct: 1 },
  { question: "The opposite of 'high' is:", choices: ["lofty","low","tall","steep"], correct: 1 },
  { question: "The opposite of 'love' is:", choices: ["affection","hate","care","like"], correct: 1 },
  { question: "The opposite of 'open' is:", choices: ["ajar","closed","wide","clear"], correct: 1 },
  { question: "The opposite of 'rich' is:", choices: ["wealthy","poor","comfortable","stable"], correct: 1 },
  { question: "The opposite of 'wet' is:", choices: ["damp","dry","moist","soggy"], correct: 1 },
  { question: "The opposite of 'light' is:", choices: ["bright","dark","faint","sunny"], correct: 1 },
  { question: "The opposite of 'easy' is:", choices: ["simple","difficult","plain","quick"], correct: 1 },
  { question: "The opposite of 'always' is:", choices: ["forever","never","often","yet"], correct: 1 },
  { question: "The opposite of 'true' is:", choices: ["real","false","sure","fact"], correct: 1 },
  { question: "The opposite of 'arrive' is:", choices: ["depart","reach","come","greet"], correct: 0 },
  { question: "The opposite of 'expand' is:", choices: ["enlarge","shrink","grow","widen"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AntonymQuizSettings): AntonymQuizState {
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
export function reducer(state: AntonymQuizState, action: AntonymQuizAction): AntonymQuizState {
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
export function isTerminal(state: AntonymQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

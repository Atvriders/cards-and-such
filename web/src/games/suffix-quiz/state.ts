import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SuffixQuizSettings { questions: "8" | "12"; }
export interface SuffixQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SuffixQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The suffix '-er' often turns a verb into a:", choices: ["place","person/agent","time","number"], correct: 1 },
  { question: "The suffix '-ful' typically forms:", choices: ["a verb","an adjective","a number","an article"], correct: 1 },
  { question: "The suffix '-less' means:", choices: ["with","without","more","again"], correct: 1 },
  { question: "The suffix '-ly' typically forms:", choices: ["a noun","an adverb","a verb","a number"], correct: 1 },
  { question: "The suffix '-able' means:", choices: ["before","capable of","without","beside"], correct: 1 },
  { question: "The suffix '-tion' typically forms:", choices: ["a verb","a noun","an adjective","a preposition"], correct: 1 },
  { question: "The suffix '-ous' typically forms:", choices: ["a verb","an adjective","a noun","an adverb"], correct: 1 },
  { question: "The suffix '-ist' often denotes:", choices: ["place","a person/practitioner","time","number"], correct: 1 },
  { question: "The suffix '-ize' typically forms:", choices: ["a noun","a verb","an adjective","an article"], correct: 1 },
  { question: "The suffix '-ness' typically forms:", choices: ["a verb","a noun (state)","a number","a preposition"], correct: 1 },
  { question: "Which suffix would create 'beautiful'?", choices: ["-less","-ful","-ly","-er"], correct: 1 },
  { question: "Which suffix would create 'quickly'?", choices: ["-able","-ly","-ous","-tion"], correct: 1 },
  { question: "The suffix '-ish' typically means:", choices: ["like/somewhat","completely","strongly","never"], correct: 0 },
  { question: "The suffix '-hood' often forms:", choices: ["a number","a state/condition","an adverb","a verb"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SuffixQuizSettings): SuffixQuizState {
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
export function reducer(state: SuffixQuizState, action: SuffixQuizAction): SuffixQuizState {
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
export function isTerminal(state: SuffixQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

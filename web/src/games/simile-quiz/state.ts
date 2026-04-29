import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SimileQuizSettings { questions: "8" | "12"; }
export interface SimileQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SimileQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "As brave as a...", choices: ["mouse","lion","kitten","fish"], correct: 1 },
  { question: "As busy as a...", choices: ["snail","bee","cow","worm"], correct: 1 },
  { question: "As blind as a...", choices: ["wolf","bat","tiger","fox"], correct: 1 },
  { question: "As cold as...", choices: ["ice","fire","sand","grass"], correct: 0 },
  { question: "As light as a...", choices: ["rock","feather","brick","tree"], correct: 1 },
  { question: "As quiet as a...", choices: ["bell","mouse","drum","horn"], correct: 1 },
  { question: "As slow as a...", choices: ["hare","snail","cheetah","horse"], correct: 1 },
  { question: "As stubborn as a...", choices: ["dog","mule","cat","rabbit"], correct: 1 },
  { question: "As sweet as...", choices: ["lemon","sugar","salt","mud"], correct: 1 },
  { question: "As wise as an...", choices: ["ant","owl","ass","ox"], correct: 1 },
  { question: "Sleeps like a...", choices: ["bird","log","fish","tree"], correct: 1 },
  { question: "Sings like a...", choices: ["frog","bird","cat","cow"], correct: 1 },
  { question: "Eats like a...", choices: ["sparrow","horse","fish","cricket"], correct: 1 },
  { question: "As hard as a...", choices: ["pillow","rock","feather","cloud"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SimileQuizSettings): SimileQuizState {
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
export function reducer(state: SimileQuizState, action: SimileQuizAction): SimileQuizState {
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
export function isTerminal(state: SimileQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

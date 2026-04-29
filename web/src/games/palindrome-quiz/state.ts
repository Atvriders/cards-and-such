import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PalindromeQuizSettings { questions: "8" | "12"; }
export interface PalindromeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PalindromeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which word is a palindrome?", choices: ["banana","racecar","apple","window"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["dragon","level","forest","candle"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["river","kayak","ocean","desert"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["table","stats","chair","window"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["mirror","madam","candle","window"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["castle","civic","dungeon","tower"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["radar","planet","ocean","tunnel"], correct: 0 },
  { question: "Which word is a palindrome?", choices: ["puppy","refer","bridge","valley"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["sunny","noon","cloud","windy"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["paper","rotor","pencil","eraser"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["window","solos","porch","garage"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["castle","tenet","drawer","cellar"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["dazzle","redder","tunnel","window"], correct: 1 },
  { question: "Which word is a palindrome?", choices: ["puppet","peep","ladder","bridge"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PalindromeQuizSettings): PalindromeQuizState {
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
export function reducer(state: PalindromeQuizState, action: PalindromeQuizAction): PalindromeQuizState {
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
export function isTerminal(state: PalindromeQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

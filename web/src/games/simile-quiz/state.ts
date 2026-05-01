import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SimileQuizSettings { questions: "8" | "12"; }
export interface SimileQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SimileQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "As busy as a...", choices: ["snail","bee","sloth","stone"], correct: 1 },
  { question: "As blind as a...", choices: ["fox","bat","cat","dog"], correct: 1 },
  { question: "As cold as...", choices: ["fire","ice","sun","sand"], correct: 1 },
  { question: "As light as a...", choices: ["brick","feather","stone","log"], correct: 1 },
  { question: "As strong as an...", choices: ["ox","ant","owl","oak"], correct: 0 },
  { question: "As white as...", choices: ["coal","snow","mud","tar"], correct: 1 },
  { question: "As black as...", choices: ["snow","milk","coal","sand"], correct: 2 },
  { question: "As quick as a...", choices: ["turtle","flash","worm","tree"], correct: 1 },
  { question: "As quiet as a...", choices: ["lion","mouse","whale","trumpet"], correct: 1 },
  { question: "As slow as a...", choices: ["cheetah","snail","jet","arrow"], correct: 1 },
  { question: "As proud as a...", choices: ["mouse","peacock","worm","fish"], correct: 1 },
  { question: "As wise as an...", choices: ["ant","owl","ox","elf"], correct: 1 },
  { question: "As stubborn as a...", choices: ["mule","fly","rose","cup"], correct: 0 },
  { question: "As cool as a...", choices: ["fire","cucumber","oven","stone"], correct: 1 },
  { question: "As fit as a...", choices: ["fiddle","drum","spoon","rope"], correct: 0 },
  { question: "As clear as...", choices: ["mud","crystal","fog","smoke"], correct: 1 },
  { question: "As old as the...", choices: ["clock","hills","baby","door"], correct: 1 },
  { question: "As gentle as a...", choices: ["bear","lamb","tiger","wolf"], correct: 1 },
  { question: "As fresh as a...", choices: ["stone","daisy","brick","log"], correct: 1 },
  { question: "As stiff as a...", choices: ["pillow","board","sponge","cloud"], correct: 1 },
  { question: "As hard as a...", choices: ["pillow","rock","bubble","cotton"], correct: 1 },
  { question: "As sharp as a...", choices: ["spoon","tack","cushion","sponge"], correct: 1 },
  { question: "As sweet as...", choices: ["lemon","sugar","salt","vinegar"], correct: 1 },
  { question: "As sour as a...", choices: ["plum","lemon","banana","melon"], correct: 1 },
  { question: "As red as a...", choices: ["leaf","rose","stone","cloud"], correct: 1 },
  { question: "As green as...", choices: ["fire","grass","snow","milk"], correct: 1 },
  { question: "As tall as a...", choices: ["mouse","tree","flea","ant"], correct: 1 },
  { question: "As deep as the...", choices: ["puddle","ocean","cup","spoon"], correct: 1 },
  { question: "As dry as a...", choices: ["bone","river","sponge","cloud"], correct: 0 },
  { question: "As mad as a...", choices: ["calm bee","hatter","sleepy cat","quiet sloth"], correct: 1 }
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

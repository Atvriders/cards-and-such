import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OxymoronQuizSettings { questions: "8" | "12"; }
export interface OxymoronQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OxymoronQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which is an oxymoron?", choices: ["jumbo shrimp","big tall man","cold ice","loud roar"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["deafening silence","loud noise","quiet whisper","bright sun"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["bittersweet","very sour","truly happy","just okay"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["sweet sorrow","sweet candy","sweet drink","sweet smile"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["original copy","exact replica","perfect duplicate","clear photocopy"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["open secret","whispered rumor","loud shout","clear sound"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["clearly confused","obviously simple","plainly clear","easily done"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["awfully good","very good","really good","truly good"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["seriously funny","truly silly","intensely happy","quietly sad"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["small crowd","tiny mouse","large elephant","huge giant"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["alone together","together close","far apart","near together"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["act naturally","behave normally","dance freely","sing softly"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["minor crisis","major problem","big issue","small worry"], correct: 0 },
  { question: "Which is an oxymoron?", choices: ["controlled chaos","quiet riot","both options","ordered mess"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OxymoronQuizSettings): OxymoronQuizState {
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
export function reducer(state: OxymoronQuizState, action: OxymoronQuizAction): OxymoronQuizState {
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
export function isTerminal(state: OxymoronQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

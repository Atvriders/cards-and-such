import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FibbageQuizSettings { dummy: boolean; }
export interface FibbageQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FibbageQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Fibbage was developed by?", choices: ["Hidden Path", "Jackbox Games", "Telltale", "Double Fine"], correct: 1 },
  { question: "Players input answers via?", choices: ["A controller", "Their smartphone or tablet", "A keyboard", "Their voice"], correct: 1 },
  { question: "Original Fibbage was released in?", choices: ["2010", "2014", "2017", "2020"], correct: 1 },
  { question: "Fibbage 2 introduced what category?", choices: ["Trivia Tank", "Final Fibbage", "Defuse", "Slap Battles"], correct: 1 },
  { question: "How do players score in Fibbage?", choices: ["By drawing", "By picking the truth and fooling others", "By yelling", "By voting first"], correct: 1 },
  { question: "Fibbage 3 is part of which Jackbox pack?", choices: ["Pack 2", "Pack 4", "Pack 7", "Party Pack 1"], correct: 1 },
  { question: "Fibbage XL is best described as?", choices: ["A sequel", "An expanded version of original", "A spinoff", "A mobile-only port"], correct: 1 },
  { question: "Audience members can?", choices: ["Play directly", "Vote and influence scores", "Watch only", "Do nothing"], correct: 1 },
  { question: "Maximum players in classic Fibbage is?", choices: ["4", "6", "8", "12"], correct: 2 },
  { question: "'Enough About You' is a category in?", choices: ["Fibbage 1", "Fibbage 2 and beyond", "Drawful", "Quiplash"], correct: 1 },
  { question: "Fibbage's title comes from?", choices: ["A real word", "Slang for telling lies", "An acronym", "A character name"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: FibbageQuizSettings): FibbageQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: FibbageQuizState, action: FibbageQuizAction): FibbageQuizState {
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
export function isTerminal(state: FibbageQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DrawfulQuizSettings { dummy: boolean; }
export interface DrawfulQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DrawfulQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Drawful is published by?", choices: ["Jackbox Games", "Hasbro", "Mattel", "Spin Master"], correct: 0 },
  { question: "Drawful 2 was released in?", choices: ["2014", "2016", "2018", "2020"], correct: 1 },
  { question: "Players draw using their?", choices: ["Phone or tablet", "A wheel", "A stylus", "A piece of paper"], correct: 0 },
  { question: "Original Drawful is part of?", choices: ["Jackbox Party Pack 1", "Jackbox Party Pack 3", "Pack 7", "No pack"], correct: 0 },
  { question: "After drawing, other players?", choices: ["Comment", "Submit fake titles", "Vote winners", "Do nothing"], correct: 1 },
  { question: "Drawful 2 was offered free during?", choices: ["The 2010 Olympics", "The 2020 COVID-19 lockdowns", "E3 2015", "PAX 2018"], correct: 1 },
  { question: "Audience members can?", choices: ["Play silently", "Submit titles and vote", "Do nothing", "Just watch"], correct: 1 },
  { question: "Each player gets how many drawing prompts in classic mode?", choices: ["1", "2", "3", "5"], correct: 1 },
  { question: "Maximum players in Drawful is typically?", choices: ["4", "6", "8", "10"], correct: 2 },
  { question: "Players score points when others?", choices: ["Pick their fake title", "Pick their drawing's real title", "Boo them", "Don't vote"], correct: 0 },
  { question: "'Drawful Animate' adds?", choices: ["Voice acting", "Animation features", "Music", "Dice"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: DrawfulQuizSettings): DrawfulQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: DrawfulQuizState, action: DrawfulQuizAction): DrawfulQuizState {
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
export function isTerminal(state: DrawfulQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

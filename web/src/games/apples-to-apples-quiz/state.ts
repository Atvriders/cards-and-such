import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ApplesToApplesQuizSettings { dummy: boolean; }
export interface ApplesToApplesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ApplesToApplesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Apples to Apples was first published in?", choices: ["1995", "1999", "2003", "2007"], correct: 1 },
  { question: "Cards in Apples to Apples come in two colors:", choices: ["Red and green", "Black and white", "Blue and yellow", "Pink and orange"], correct: 0 },
  { question: "The green apple cards represent?", choices: ["Adjectives/descriptors", "Nouns", "Verbs", "Numbers"], correct: 0 },
  { question: "The red apple cards represent?", choices: ["Adjectives", "Nouns", "Verbs", "Sentences"], correct: 1 },
  { question: "Each round has one player acting as?", choices: ["Dealer", "Judge", "Spy", "Banker"], correct: 1 },
  { question: "Mattel acquired Apples to Apples in?", choices: ["2002", "2007", "2012", "2015"], correct: 1 },
  { question: "The party game spinoff infamous for adult themes is?", choices: ["Loaded Questions", "Cards Against Humanity", "Codenames", "Dixit"], correct: 1 },
  { question: "Apples to Apples Junior is for ages?", choices: ["3+", "9+", "13+", "18+"], correct: 1 },
  { question: "Number of green cards needed to win classic varies by player count, often around?", choices: ["1", "4-6", "10-12", "20"], correct: 1 },
  { question: "Big Picture variant replaces nouns with?", choices: ["Numbers", "Pictures", "Verbs", "Songs"], correct: 1 },
  { question: "Apples to Apples is often credited as inspiration for?", choices: ["Risk", "Cards Against Humanity", "Settlers of Catan", "Monopoly"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: ApplesToApplesQuizSettings): ApplesToApplesQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: ApplesToApplesQuizState, action: ApplesToApplesQuizAction): ApplesToApplesQuizState {
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
export function isTerminal(state: ApplesToApplesQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DixitQuizSettings { dummy: boolean; }
export interface DixitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DixitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Dixit was first published in?", choices: ["2005", "2008", "2010", "2014"], correct: 1 },
  { question: "Dixit's main publisher is?", choices: ["Libellud", "Days of Wonder", "Z-Man Games", "Asmodee Studios"], correct: 0 },
  { question: "Original illustrations are by?", choices: ["Marie Cardouat", "John Howe", "Tomek Larek", "Vincent Dutrait"], correct: 0 },
  { question: "Dixit won Spiel des Jahres in?", choices: ["2008", "2010", "2012", "2014"], correct: 1 },
  { question: "Scoring pieces are shaped like?", choices: ["Bunnies", "Cats", "Bears", "Frogs"], correct: 0 },
  { question: "Dixit Odyssey supports up to how many players?", choices: ["6", "8", "10", "12"], correct: 3 },
  { question: "Storyteller's clue should be?", choices: ["Crystal clear", "Some-but-not-all-can-guess", "Always cryptic", "Always literal"], correct: 1 },
  { question: "If everyone guesses, the storyteller scores?", choices: ["6", "0", "3", "10"], correct: 1 },
  { question: "Number of cards in original Dixit base set is?", choices: ["48", "84", "100", "120"], correct: 1 },
  { question: "First player to reach what score wins?", choices: ["10", "20", "30", "50"], correct: 2 },
  { question: "Dixit's designer is?", choices: ["Jean-Louis Roubira", "Antoine Bauza", "Reiner Knizia", "Bruno Cathala"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: DixitQuizSettings): DixitQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: DixitQuizState, action: DixitQuizAction): DixitQuizState {
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
export function isTerminal(state: DixitQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

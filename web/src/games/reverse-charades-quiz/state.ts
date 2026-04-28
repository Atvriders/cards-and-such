import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReverseCharadesQuizSettings { dummy: boolean; }
export interface ReverseCharadesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReverseCharadesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Reverse Charades, who acts?", choices: ["One person", "The whole team", "Two players", "Nobody"], correct: 1 },
  { question: "Who guesses?", choices: ["The whole team", "One person", "The judge", "The audience"], correct: 1 },
  { question: "Reverse Charades was created by?", choices: ["Spin Master", "Wonder Forge / USAopoly", "Hasbro", "Mattel"], correct: 1 },
  { question: "Recommended ages for Reverse Charades typically start at?", choices: ["3+", "6+", "10+", "13+"], correct: 1 },
  { question: "Round timer is usually?", choices: ["30 seconds", "60 seconds", "90 seconds", "5 minutes"], correct: 1 },
  { question: "The role reversal means more people are?", choices: ["Sitting still", "Acting at once", "Talking", "Drawing"], correct: 1 },
  { question: "Cards typically contain?", choices: ["Numbers", "Words to act out", "Drawings", "Songs"], correct: 1 },
  { question: "Compared to classic charades, energy is generally?", choices: ["Lower", "Higher", "The same", "Negative"], correct: 1 },
  { question: "Best player count for Reverse Charades is?", choices: ["1-2", "4-20", "30+", "exactly 3"], correct: 1 },
  { question: "Goal of each round is to?", choices: ["Stump the guesser", "Get the guesser to say the word", "Win silently", "Sing it"], correct: 1 },
  { question: "A typical box includes how many cards?", choices: ["50", "350+", "10", "10000"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: ReverseCharadesQuizSettings): ReverseCharadesQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: ReverseCharadesQuizState, action: ReverseCharadesQuizAction): ReverseCharadesQuizState {
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
export function isTerminal(state: ReverseCharadesQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WitsWagersQuizSettings { dummy: boolean; }
export interface WitsWagersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WitsWagersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Wits and Wagers is published by?", choices: ["North Star Games", "Hasbro", "Mattel", "Asmodee"], correct: 0 },
  { question: "Wits and Wagers was designed by?", choices: ["Dominic Crapuchettes", "Antoine Bauza", "Mike Selinker", "Mark Rosewater"], correct: 0 },
  { question: "Every question's answer is?", choices: ["Multiple choice", "A number", "A picture", "A word"], correct: 1 },
  { question: "Players write their guess on?", choices: ["A pad of paper", "A dry-erase board", "A clay tablet", "Cards"], correct: 1 },
  { question: "After guesses are revealed, players?", choices: ["Bet on which guess is closest", "Vote on best", "Eat cake", "Roll dice"], correct: 0 },
  { question: "The first edition was released in?", choices: ["2003", "2005", "2007", "2009"], correct: 2 },
  { question: "Wits and Wagers won an award in?", choices: ["Spiel des Jahres", "Mensa Select", "Origins", "Multiple awards"], correct: 3 },
  { question: "Family Edition simplifies by?", choices: ["Adding cards", "Removing betting chips, simpler scoring", "Less players", "More dice"], correct: 1 },
  { question: "Highest payout typically goes to?", choices: ["The closest correct guess", "Longest-shot bet on closest correct guess", "First player", "Worst guess"], correct: 1 },
  { question: "Vegas Edition feature is?", choices: ["Only Vegas trivia", "Casino-style chips and bigger betting", "Slot machine", "Dealer hat"], correct: 1 },
  { question: "The Party Edition supports up to?", choices: ["7 players", "12 players", "18 players", "30 players"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: WitsWagersQuizSettings): WitsWagersQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: WitsWagersQuizState, action: WitsWagersQuizAction): WitsWagersQuizState {
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
export function isTerminal(state: WitsWagersQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

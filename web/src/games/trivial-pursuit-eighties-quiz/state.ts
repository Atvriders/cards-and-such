import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrivialPursuitEightiesQuizSettings { dummy: boolean; }
export interface TrivialPursuitEightiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrivialPursuitEightiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who hosted MTV's 'Headbangers Ball' starting 1987?", choices: ["Riki Rachtman", "Kevin Seal", "Adam Curry", "Martha Quinn"], correct: 1 },
  { question: "Which 1985 film popularized the DeLorean?", choices: ["Top Gun", "Back to the Future", "The Goonies", "Ghostbusters"], correct: 1 },
  { question: "The Berlin Wall fell in?", choices: ["1985", "1987", "1989", "1991"], correct: 2 },
  { question: "Madonna's debut album came out in?", choices: ["1981", "1983", "1986", "1988"], correct: 1 },
  { question: "Pac-Man was released in arcades in?", choices: ["1978", "1980", "1983", "1986"], correct: 1 },
  { question: "'Thriller' by Michael Jackson released in?", choices: ["1980", "1982", "1984", "1986"], correct: 1 },
  { question: "The first Apple Macintosh debuted in?", choices: ["1980", "1984", "1987", "1989"], correct: 1 },
  { question: "Tetris was created in 1984 by?", choices: ["Shigeru Miyamoto", "Alexey Pajitnov", "Hideo Kojima", "Will Wright"], correct: 1 },
  { question: "'Just Say No' campaign was launched by?", choices: ["Hillary Clinton", "Nancy Reagan", "Barbara Bush", "Rosalynn Carter"], correct: 1 },
  { question: "Which year did Live Aid take place?", choices: ["1983", "1984", "1985", "1986"], correct: 2 },
  { question: "Chernobyl disaster occurred in?", choices: ["1984", "1985", "1986", "1988"], correct: 2 },
  { question: "MTV first aired in?", choices: ["1979", "1981", "1983", "1985"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _s: TrivialPursuitEightiesQuizSettings): TrivialPursuitEightiesQuizState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(10, ALL_QUESTIONS.length));
  const questions = pool.map(q => { const idx = q.choices.map((c,i)=>({c,i})); const s=shuffle(idx,rng); const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3; return { ...q, choices: s.map(x=>x.c) as [string,string,string,string], correct: nc }; });
  return { questions, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: TrivialPursuitEightiesQuizState, action: TrivialPursuitEightiesQuizAction): TrivialPursuitEightiesQuizState {
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
export function isTerminal(state: TrivialPursuitEightiesQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }

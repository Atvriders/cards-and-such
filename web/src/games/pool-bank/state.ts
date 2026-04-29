import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Bank pool requires", choices: ["Rail before pocket","Direct shot","Combination","Jump"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Direct pocket counts", choices: ["No (foul)","Yes","Sometimes","Bonus"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Cushion contact required", choices: ["Yes","No","On 8 only","Sometimes"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Score per legal bank", choices: ["1 point","5","10","0"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Race typical to", choices: ["8 or 9 balls","150","50","100"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Cross-side bank means", choices: ["Two short rails","Long rail","Triple bank","Pocket"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Cross-corner bank", choices: ["Two rails to corner","Direct corner","Combination","Jump"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Multiple-rail allowed", choices: ["Yes","No","Only on 8","Triples"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Object ball jumped", choices: ["Foul","Legal","Bonus","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Win condition", choices: ["Race to N banks","Pocket 8","Score 150","Time"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
];

export interface GameSettings { rounds: "5" | "8" | "10"; }

export interface PuzzleRound {
  prompt: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface GameState {
  rounds: PuzzleRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type GameAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: GameSettings): GameState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const pool = shuffle([...PUZZLES], rng).slice(0, Math.min(count, PUZZLES.length));
  const rounds: PuzzleRound[] = pool.map(p => ({
    prompt: p.prompt,
    choices: [...p.choices] as [string, string, string, string],
    correct: p.correctIndex,
  }));
  return { rounds, currentIndex: 0, selected: null, submitted: false, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select":
      return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const r = state.rounds[state.currentIndex]!;
      const ok = state.selected === r.correct;
      const pts = ok ? 100 : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.rounds.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: GameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

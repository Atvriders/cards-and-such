import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Each player chooses", choices: ["Personal number","Same number","Bull","Triple 20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Earn killer status by hitting", choices: ["Own double","Own single","Bull","Triple"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Killer attacks by hitting", choices: ["Opponent double","Opponent single","Bull","Triple 20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Each player starts with lives", choices: ["3 or 5","1","10","20"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Lose all lives = ", choices: ["Out","Win","Reset","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Cannot attack until", choices: ["You become killer","First round","Bull is hit","Triple"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Self-hit kills you", choices: ["Yes (some rules)","No","Heals","Bonus"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Best killer aim", choices: ["Opponent double","Bull","Triple 20","Outer single"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Last player wins", choices: ["Yes","No","Tie always","Skip"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
  { prompt: "Friendly version skips", choices: ["Self-hit kill","Killing","Doubles","Lives"] as [string,string,string,string], correctIndex: 0 as 0|1|2|3 },
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

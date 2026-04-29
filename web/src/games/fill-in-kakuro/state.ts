import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Sum 10 of 2 cells, one is 3, other =", choices: ["5", "6", "7", "8"], correctIndex: 2 },
  { prompt: "Sum 17 of 2 cells, one is 9, other =", choices: ["6", "7", "8", "9"], correctIndex: 2 },
  { prompt: "Sum 6 of 2 cells, one is 1, other =", choices: ["3", "4", "5", "6"], correctIndex: 2 },
  { prompt: "Sum 12 of 3 cells, two are 1+2, third =", choices: ["7", "8", "9", "10"], correctIndex: 2 },
  { prompt: "Sum 15 of 2 cells, one is 8, other =", choices: ["5", "6", "7", "8"], correctIndex: 2 },
  { prompt: "Sum 11 of 2 cells, one is 4, other =", choices: ["5", "6", "7", "8"], correctIndex: 2 },
  { prompt: "Sum 9 of 3 cells, two are 1+2, third =", choices: ["4", "5", "6", "7"], correctIndex: 2 },
  { prompt: "Sum 14 of 2 cells, one is 5, other =", choices: ["7", "8", "9", "10"], correctIndex: 2 },
  { prompt: "Sum 7 of 2 cells, one is 2, other =", choices: ["3", "4", "5", "6"], correctIndex: 2 },
  { prompt: "Sum 13 of 2 cells, one is 4, other =", choices: ["7", "8", "9", "10"], correctIndex: 2 },
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

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "3-1-20 = ?", choices: ["DOG", "CAT", "RAT", "BAT"], correctIndex: 1 },
  { prompt: "16-9-7 (P=16,I=9,G=7) = ?", choices: ["DOG", "PIG", "PIE", "PUG"], correctIndex: 1 },
  { prompt: "19-21-14 = ?", choices: ["MOON", "SUN", "STAR", "SKY"], correctIndex: 1 },
  { prompt: "2-1-12-12 = ?", choices: ["BELL", "BULL", "BALL", "BILL"], correctIndex: 2 },
  { prompt: "13-9-12-11 = ?", choices: ["MILK", "MILD", "MICK", "MILL"], correctIndex: 0 },
  { prompt: "8-15-13-5 = ?", choices: ["HEME", "HOPE", "HOME", "HOSE"], correctIndex: 2 },
  { prompt: "20-9-13-5 = ?", choices: ["TIME", "TILE", "TIDE", "TONE"], correctIndex: 0 },
  { prompt: "5-1-19-20 = ?", choices: ["EAST", "WEST", "FAST", "LAST"], correctIndex: 0 },
  { prompt: "12-9-14-11 = ?", choices: ["LINK", "PINK", "MINK", "WINK"], correctIndex: 0 },
  { prompt: "7-1-20-5 = ?", choices: ["GAVE", "GAZE", "GATE", "GAPE"], correctIndex: 2 },
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

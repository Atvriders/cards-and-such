import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Letters: C A T H R E", choices: ["BIRD", "REACH", "PLAY", "JUMP"], correctIndex: 1 },
  { prompt: "Letters: B L O O M N", choices: ["BLOOM", "TIGER", "PIANO", "RIVER"], correctIndex: 0 },
  { prompt: "Letters: H O U S E S", choices: ["HOUSE", "TRAIN", "PIZZA", "SUGAR"], correctIndex: 0 },
  { prompt: "Letters: P L A T E S", choices: ["PEACE", "PLATE", "GHOST", "QUICK"], correctIndex: 1 },
  { prompt: "Letters: R E A D S T", choices: ["TREAD", "WORLD", "JOLLY", "MAGIC"], correctIndex: 0 },
  { prompt: "Letters: B R A V E S", choices: ["BRAVE", "WHALE", "JOLLY", "SOUTH"], correctIndex: 0 },
  { prompt: "Letters: S T O R Y N", choices: ["BAKER", "STORY", "HAPPY", "GUEST"], correctIndex: 1 },
  { prompt: "Letters: T R A C K E", choices: ["TRACK", "JOKES", "HEAVY", "MOTOR"], correctIndex: 0 },
  { prompt: "Letters: F A S T O P", choices: ["FORTS", "FASTOP", "FAST", "ZEBRA"], correctIndex: 2 },
  { prompt: "Letters: G L O W S T", choices: ["GLOWS", "BREAD", "MIDDLE", "ENERGY"], correctIndex: 0 },
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

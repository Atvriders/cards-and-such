import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "A=big/1pt, B=med/3pt, C=tiny/10pt — best balanced?", choices: ["A", "B", "C", "Skip"], correctIndex: 1 },
  { prompt: "All same size, A worth most", choices: ["A", "B", "C", "Skip"], correctIndex: 0 },
  { prompt: "Closest balloon highest payoff", choices: ["Closest", "Mid", "Far", "Skip"], correctIndex: 0 },
  { prompt: "Wind makes far balloons impossible", choices: ["Closest", "Far", "Skip", "Random"], correctIndex: 0 },
  { prompt: "Tiny balloon = jackpot, but odds bad", choices: ["Med safe", "Tiny", "Big low", "Skip"], correctIndex: 0 },
  { prompt: "Last dart, behind on score", choices: ["Tiny jackpot", "Med safe", "Big low", "Skip"], correctIndex: 0 },
  { prompt: "First dart, comfortable lead", choices: ["Med safe", "Tiny risk", "Big easy", "Skip"], correctIndex: 0 },
  { prompt: "Cluster of three close balloons", choices: ["Aim cluster", "Aim single", "Aim wall", "Skip"], correctIndex: 0 },
  { prompt: "One balloon spinning fast", choices: ["Wait still", "Throw now", "Aim around", "Skip"], correctIndex: 0 },
  { prompt: "Single balloon, no other targets", choices: ["Aim direct", "Random", "Skip", "Side"], correctIndex: 0 },
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

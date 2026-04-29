import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Center T, petals A R E S I N", choices: ["TRAINS", "MAGIC", "JOLLY", "PIANO"], correctIndex: 0 },
  { prompt: "Center A, petals R E S T O N", choices: ["ANTRES", "MAGIC", "JOLLY", "PIANO"], correctIndex: 0 },
  { prompt: "Center O, petals A E R T S N", choices: ["ORATES", "MAGIC", "JOLLY", "PIANO"], correctIndex: 0 },
  { prompt: "Center E, petals A R T S N P", choices: ["ENTRAPS", "MAGIC", "JOLLY", "PIANO"], correctIndex: 0 },
  { prompt: "Center M, petals A E I L S T", choices: ["METALS", "JOLLY", "ZEBRA", "QUICK"], correctIndex: 0 },
  { prompt: "Center R, petals A E I O T S", choices: ["RATIOS", "MAGIC", "JOLLY", "QUICK"], correctIndex: 0 },
  { prompt: "Center N, petals A E I O R T", choices: ["NATIVE", "MAGIC", "JOLLY", "QUICK"], correctIndex: 0 },
  { prompt: "Center S, petals A E I O R T", choices: ["SORTIE", "MAGIC", "JOLLY", "QUICK"], correctIndex: 0 },
  { prompt: "Center L, petals A E I O R T", choices: ["LOITER", "MAGIC", "JOLLY", "QUICK"], correctIndex: 0 },
  { prompt: "Center P, petals A E I O R T", choices: ["PIRATE", "MAGIC", "JOLLY", "QUICK"], correctIndex: 0 },
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

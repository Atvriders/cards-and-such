import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Puzzle { prompt: string; choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3; }

export const PUZZLES: Puzzle[] = [
  { prompt: "Cats: A) sleep 16h, B) have 9 lives literally, C) purr to soothe", choices: ["A", "B", "C", "All true"], correctIndex: 1 },
  { prompt: "Mt. Everest: A) tallest, B) named after person, C) is shrinking", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
  { prompt: "Bananas: A) berry, B) radioactive a bit, C) banana plant is a tree", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
  { prompt: "Bees: A) dance to communicate, B) all bees can sting, C) make honey", choices: ["A", "B", "C", "All true"], correctIndex: 1 },
  { prompt: "Sharks: A) older than trees, B) all in salt water, C) some give live birth", choices: ["A", "B", "C", "All true"], correctIndex: 1 },
  { prompt: "Moon: A) drifting away, B) has Earth-like air, C) shows same face", choices: ["A", "B", "C", "All true"], correctIndex: 1 },
  { prompt: "Octopuses: A) three hearts, B) blue blood, C) all venom is harmless", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
  { prompt: "Chocolate: A) toxic to dogs, B) made from beans, C) grows on bushes", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
  { prompt: "Eiffel Tower: A) built 1889, B) painted often, C) largest building on Earth", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
  { prompt: "Great Wall: A) thousands of miles, B) visible from space (claim), C) made of cheese", choices: ["A", "B", "C", "All true"], correctIndex: 2 },
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

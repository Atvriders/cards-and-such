import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DotToDotSettings {
  dots: "10" | "20" | "30";
}

export interface Point {
  x: number;
  y: number;
  num: number;
}

export interface DotToDotState {
  settings: DotToDotSettings;
  points: Point[];
  nextDot: number;        // which dot number player must click next (1-indexed)
  totalDots: number;
  mistakes: number;
  completed: boolean;
  gameOver: boolean;
}

export type DotToDotAction =
  | { type: "click-dot"; num: number };

export function initialState(seed: number, settings: DotToDotSettings): DotToDotState {
  const rng = mulberry32(seed);
  const total = parseInt(settings.dots, 10);

  // Generate non-overlapping points in a 400x400 canvas
  const points: Point[] = [];
  for (let n = 1; n <= total; n++) {
    let x: number, y: number;
    let tries = 0;
    do {
      x = Math.floor(rng() * 340) + 30;
      y = Math.floor(rng() * 340) + 30;
      tries++;
    } while (tries < 20 && points.some(p => Math.hypot(p.x - x, p.y - y) < 40));
    points.push({ x, y, num: n });
  }

  return {
    settings,
    points,
    nextDot: 1,
    totalDots: total,
    mistakes: 0,
    completed: false,
    gameOver: false,
  };
}

export function reducer(state: DotToDotState, action: DotToDotAction): DotToDotState {
  if (state.gameOver) return state;

  if (action.type === "click-dot") {
    if (action.num === state.nextDot) {
      const nextDot = state.nextDot + 1;
      const completed = nextDot > state.totalDots;
      return {
        ...state,
        nextDot,
        completed,
        gameOver: completed,
      };
    } else {
      // Wrong dot — count mistake
      return { ...state, mistakes: state.mistakes + 1 };
    }
  }

  return state;
}

export function isTerminal(state: DotToDotState): { score: number } | null {
  if (!state.gameOver) return null;
  const penalty = state.mistakes * 10;
  const base = state.totalDots * 20;
  return { score: Math.max(0, base - penalty) };
}

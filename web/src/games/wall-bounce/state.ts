import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Wall Bounce: bounce a ball to hit targets.
// Player chooses angle (1-5), ball bounces off walls, score based on targets hit.

export interface WallBounceState {
  rngSeed: number;
  targets: boolean[];   // 5 targets, true = still standing
  lastAngle: number | null;
  lastHits: number;
  shotsRemaining: number;
  score: number;
  gameOver: boolean;
}

export type WallBounceAction = { type: "shoot"; angle: number };

// Each angle (1-5) hits a subset of the 5 targets based on bounce pattern
const ANGLE_HITS: Record<number, number[]> = {
  1: [0, 2],
  2: [1, 3],
  3: [0, 4],
  4: [2, 3],
  5: [1, 4],
};

export function initialState(seed: number): WallBounceState {
  const rng = mulberry32(seed);
  // Randomize which targets start as active (all active initially)
  void rng;
  return {
    rngSeed: seed,
    targets: [true, true, true, true, true],
    lastAngle: null,
    lastHits: 0,
    shotsRemaining: 5,
    score: 0,
    gameOver: false,
  };
}

export function reducer(state: WallBounceState, action: WallBounceAction): WallBounceState {
  if (state.gameOver) return state;
  if (action.type !== "shoot") return state;
  const angle = Math.max(1, Math.min(5, Math.round(action.angle)));
  const pattern = ANGLE_HITS[angle] ?? [];
  const targets = [...state.targets];
  let hits = 0;
  for (const idx of pattern) {
    if (targets[idx]) {
      targets[idx] = false;
      hits++;
    }
  }
  const score = state.score + hits * 100;
  const shotsRemaining = state.shotsRemaining - 1;
  const allDown = targets.every((t) => !t);
  const gameOver = shotsRemaining <= 0 || allDown;
  return {
    ...state,
    targets,
    lastAngle: angle,
    lastHits: hits,
    shotsRemaining,
    score,
    gameOver,
  };
}

export function isTerminal(state: WallBounceState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}

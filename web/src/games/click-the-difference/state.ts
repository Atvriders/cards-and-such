import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Click the Difference: 10 rounds. Show two 4x4 emoji grids side by side. The
// grids are identical except for ONE cell that differs in the second grid.
// Click the differing cell on grid B (the right grid). +1 per correct,
// faster = higher score. Wrong click = miss for this round.

export const ROUNDS = 10;
export const GRID_SIZE = 4; // 4x4

const POOL = ["🍎", "🍌", "🍇", "🍒", "🍑", "🍐", "🍓", "🍉", "🍍", "🥝", "🍋", "🥥"];

export interface ClickDiffSettings {
  variation: "subtle" | "obvious";
}

export interface DiffRound {
  gridA: string[]; // length 16
  gridB: string[]; // length 16, differs from gridA at exactly 1 index
  diffIndex: number; // 0..15
}

export interface ClickDiffState {
  rngSeed: number;
  rngCounter: number;
  settings: ClickDiffSettings;
  round: number; // 1..ROUNDS
  current: DiffRound;
  attempts: number; // wrong clicks this round
  solved: boolean; // current round solved
  score: number;
  correctRounds: number;
  phase: "playing" | "done";
}

export type ClickDiffAction =
  | { type: "click"; idx: number }
  | { type: "next" };

function buildRound(seed: number, counter: number): DiffRound {
  const rng = mulberry32(seed + counter * 524287);
  const total = GRID_SIZE * GRID_SIZE;
  const gridA: string[] = [];
  for (let i = 0; i < total; i++) {
    gridA.push(POOL[Math.floor(rng() * POOL.length)]!);
  }
  const diffIndex = Math.floor(rng() * total);
  // Choose a different emoji for the swap
  let alt = POOL[Math.floor(rng() * POOL.length)]!;
  let guard = 0;
  while (alt === gridA[diffIndex] && guard < 20) {
    alt = POOL[Math.floor(rng() * POOL.length)]!;
    guard++;
  }
  if (alt === gridA[diffIndex]) {
    // Fallback: pick the next emoji in the pool
    const cur = POOL.indexOf(gridA[diffIndex]!);
    alt = POOL[(cur + 1) % POOL.length]!;
  }
  const gridB = gridA.slice();
  gridB[diffIndex] = alt;
  return { gridA, gridB, diffIndex };
}

export function initialState(seed: number, settings: ClickDiffSettings): ClickDiffState {
  const s = (seed >>> 0) || 1;
  return {
    rngSeed: s,
    rngCounter: 0,
    settings,
    round: 1,
    current: buildRound(s, 0),
    attempts: 0,
    solved: false,
    score: 0,
    correctRounds: 0,
    phase: "playing",
  };
}

export function reducer(state: ClickDiffState, action: ClickDiffAction): ClickDiffState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "click": {
      if (state.solved) return state;
      if (action.idx < 0 || action.idx >= state.current.gridB.length) return state;
      if (action.idx === state.current.diffIndex) {
        // Score formula: 10 base, -2 per wrong attempt, min 1.
        const earned = Math.max(1, 10 - state.attempts * 2);
        return {
          ...state,
          solved: true,
          score: state.score + earned,
          correctRounds: state.correctRounds + 1,
        };
      }
      return { ...state, attempts: state.attempts + 1 };
    }
    case "next": {
      if (!state.solved) return state;
      if (state.round >= ROUNDS) {
        return { ...state, phase: "done" };
      }
      const counter = state.rngCounter + 1;
      return {
        ...state,
        round: state.round + 1,
        current: buildRound(state.rngSeed, counter),
        attempts: 0,
        solved: false,
        rngCounter: counter,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: ClickDiffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

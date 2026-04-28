import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 8;

// Brian's Brain: 3 states - 0 dead, 1 alive, 2 dying.
// Rules: dead with exactly 2 alive neighbors -> alive. alive -> dying. dying -> dead.
export interface BrianSettings { dummy: boolean; }
export interface BrianState {
  rngSeed: number;
  grid: number[]; // 0/1/2
  generation: number;
  liveSum: number;
  phase: "editing" | "running" | "done";
}
export type BrianAction = { type: "toggle"; idx: number } | { type: "step" } | { type: "random" } | { type: "reset" } | { type: "finish" };

export function emptyGrid(): number[] { return new Array(SIZE * SIZE).fill(0); }

export function initialState(seed: number, _s: BrianSettings): BrianState {
  return { rngSeed: seed, grid: emptyGrid(), generation: 0, liveSum: 0, phase: "editing" };
}

export function step(grid: number[]): number[] {
  const next = emptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cur = grid[r * SIZE + c]!;
      if (cur === 1) next[r * SIZE + c] = 2; // alive -> dying
      else if (cur === 2) next[r * SIZE + c] = 0; // dying -> dead
      else {
        // count alive neighbors
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
          if (grid[nr * SIZE + nc] === 1) n += 1;
        }
        if (n === 2) next[r * SIZE + c] = 1;
      }
    }
  }
  return next;
}

export function liveCount(grid: number[]): number {
  let n = 0; for (const v of grid) if (v === 1) n += 1; return n;
}

export function reducer(state: BrianState, action: BrianAction): BrianState {
  if (state.phase === "done") return state;
  if (action.type === "toggle" && state.phase === "editing") {
    if (action.idx < 0 || action.idx >= state.grid.length) return state;
    const g = state.grid.slice();
    g[action.idx] = g[action.idx] === 1 ? 0 : 1;
    return { ...state, grid: g };
  }
  if (action.type === "random" && state.phase === "editing") {
    const rng = mulberry32(state.rngSeed);
    const g = emptyGrid();
    for (let i = 0; i < g.length; i++) g[i] = rng() < 0.3 ? 1 : 0;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, grid: g, rngSeed: nextSeed };
  }
  if (action.type === "step") {
    const ng = step(state.grid);
    const live = liveCount(ng);
    return { ...state, grid: ng, generation: state.generation + 1, liveSum: state.liveSum + live, phase: state.phase === "editing" ? "running" : state.phase };
  }
  if (action.type === "reset") {
    return initialState(state.rngSeed, { dummy: false });
  }
  if (action.type === "finish") {
    return { ...state, phase: "done" };
  }
  return state;
}

export function score(s: BrianState): number { return s.liveSum + s.generation * 3; }
export function isTerminal(s: BrianState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

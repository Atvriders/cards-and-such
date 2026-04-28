import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LightsOut5x5Settings { dummy: boolean; }

export interface LightsOut5x5State {
  rngSeed: number;
  cells: boolean[]; // 25 entries
  size: number;
  moves: number;
  phase: "playing" | "done";
}

export type LightsOut5x5Action = { type: "tap"; index: number } | { type: "reset" };

const N = 5;

function neighbors(i: number): number[] {
  const r = Math.floor(i / N), c = i % N;
  const list = [i];
  if (r > 0) list.push(i - N);
  if (r < N - 1) list.push(i + N);
  if (c > 0) list.push(i - 1);
  if (c < N - 1) list.push(i + 1);
  return list;
}

function randomBoard(seed: number): boolean[] {
  const rng = mulberry32(seed);
  const cells = new Array(N * N).fill(false) as boolean[];
  const presses = 8 + Math.floor(rng() * 7);
  for (let p = 0; p < presses; p++) {
    const i = Math.floor(rng() * N * N);
    for (const n of neighbors(i)) cells[n] = !cells[n];
  }
  if (cells.every(c => !c)) cells[0] = true;
  return cells;
}

export function isSolved(cells: boolean[]): boolean {
  return cells.every(c => !c);
}

export function initialState(seed: number, _s: LightsOut5x5Settings): LightsOut5x5State {
  return { rngSeed: seed, cells: randomBoard(seed), size: N, moves: 0, phase: "playing" };
}

export function reducer(state: LightsOut5x5State, action: LightsOut5x5Action): LightsOut5x5State {
  if (state.phase === "done") return state;
  if (action.type === "reset") return { ...state, cells: randomBoard(state.rngSeed + state.moves + 1), moves: 0, phase: "playing" };
  if (action.type === "tap") {
    const cells = [...state.cells];
    for (const n of neighbors(action.index)) cells[n] = !cells[n];
    const moves = state.moves + 1;
    const phase: "playing" | "done" = isSolved(cells) ? "done" : "playing";
    return { ...state, cells, moves, phase };
  }
  return state;
}

export function isTerminal(state: LightsOut5x5State): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(80, 600 - state.moves * 8) };
}

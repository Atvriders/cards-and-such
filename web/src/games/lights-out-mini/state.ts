import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface LightsOutMiniSettings { dummy: boolean; }
export interface LightsOutMiniState {
  rngSeed: number;
  cells: boolean[]; // 9 entries
  moves: number;
  phase: "playing" | "done";
}
export type LightsOutMiniAction = { type: "tap"; index: number } | { type: "reset" };
function neighbors(i: number): number[] {
  const r = Math.floor(i / 3), c = i % 3;
  const list = [i];
  if (r > 0) list.push(i - 3);
  if (r < 2) list.push(i + 3);
  if (c > 0) list.push(i - 1);
  if (c < 2) list.push(i + 1);
  return list;
}
function randomBoard(seed: number): boolean[] {
  const rng = mulberry32(seed);
  const cells = new Array(9).fill(false);
  // press 4-6 random cells from solved (all off) to guarantee solvable
  const presses = 4 + Math.floor(rng() * 3);
  for (let p = 0; p < presses; p++) {
    const i = Math.floor(rng() * 9);
    for (const n of neighbors(i)) cells[n] = !cells[n];
  }
  // ensure not already solved
  if (cells.every(c => !c)) cells[0] = true;
  return cells;
}
export function isSolved(cells: boolean[]): boolean {
  return cells.every(c => !c);
}
export function initialState(seed: number, _s: LightsOutMiniSettings): LightsOutMiniState {
  return { rngSeed: seed, cells: randomBoard(seed), moves: 0, phase: "playing" };
}
export function reducer(state: LightsOutMiniState, action: LightsOutMiniAction): LightsOutMiniState {
  if (state.phase === "done") return state;
  if (action.type === "reset") return { ...state, cells: randomBoard(state.rngSeed + state.moves + 1), moves: 0, phase: "playing" };
  if (action.type === "tap") {
    const cells = [...state.cells];
    for (const n of neighbors(action.index)) cells[n] = !cells[n];
    const moves = state.moves + 1;
    const phase = isSolved(cells) ? "done" : "playing";
    return { ...state, cells, moves, phase };
  }
  return state;
}
export function isTerminal(state: LightsOutMiniState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(50, 400 - state.moves * 10) };
}

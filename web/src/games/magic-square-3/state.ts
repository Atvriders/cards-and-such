import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Magic Square 3: place numbers 1-9 in a 3x3 grid so every row, column, and diagonal sums to 15.
export const TARGET = 15;
export interface MagicSquare3Settings { dummy: boolean; }
export interface MagicSquare3State {
  rngSeed: number;
  cells: number[]; // 9 entries; 0 means empty
  pool: number[];  // remaining numbers 1..9
  selected: number | null; // currently chosen number to place, or null
  moves: number;
  phase: "playing" | "done";
}
export type MagicSquare3Action =
  | { type: "pick"; value: number }
  | { type: "place"; index: number }
  | { type: "remove"; index: number }
  | { type: "reset" };
export function rowsCols(cells: number[]) {
  const rows = [cells.slice(0,3), cells.slice(3,6), cells.slice(6,9)];
  const cols = [[cells[0]!,cells[3]!,cells[6]!],[cells[1]!,cells[4]!,cells[7]!],[cells[2]!,cells[5]!,cells[8]!]];
  const diags = [[cells[0]!,cells[4]!,cells[8]!],[cells[2]!,cells[4]!,cells[6]!]];
  return { rows, cols, diags };
}
export function isMagic(cells: number[]): boolean {
  if (cells.some(v => v === 0)) return false;
  const { rows, cols, diags } = rowsCols(cells);
  const ok = (line: number[]) => line.reduce((a,b) => a+b, 0) === TARGET;
  return rows.every(ok) && cols.every(ok) && diags.every(ok);
}
export function initialState(seed: number, _s: MagicSquare3Settings): MagicSquare3State {
  const _ = mulberry32(seed); _();
  return { rngSeed: seed, cells: new Array(9).fill(0), pool: [1,2,3,4,5,6,7,8,9], selected: null, moves: 0, phase: "playing" };
}
export function reducer(state: MagicSquare3State, action: MagicSquare3Action): MagicSquare3State {
  if (state.phase === "done") return state;
  if (action.type === "reset") return { ...state, cells: new Array(9).fill(0), pool: [1,2,3,4,5,6,7,8,9], selected: null, moves: 0, phase: "playing" };
  if (action.type === "pick") {
    if (!state.pool.includes(action.value)) return state;
    return { ...state, selected: action.value };
  }
  if (action.type === "place") {
    if (state.selected === null) return state;
    if (state.cells[action.index] !== 0) return state;
    const cells = [...state.cells]; cells[action.index] = state.selected;
    const pool = state.pool.filter(v => v !== state.selected);
    const moves = state.moves + 1;
    const phase = isMagic(cells) ? "done" : "playing";
    return { ...state, cells, pool, selected: null, moves, phase };
  }
  if (action.type === "remove") {
    const v = state.cells[action.index]; if (!v) return state;
    const cells = [...state.cells]; cells[action.index] = 0;
    return { ...state, cells, pool: [...state.pool, v].sort((a,b)=>a-b), moves: state.moves + 1 };
  }
  return state;
}
export function isTerminal(state: MagicSquare3State): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(50, 400 - state.moves * 10) };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 4;
export const N = SIZE * SIZE;

export interface FifteenPuzzleSettings { dummy: boolean; }

export interface FifteenPuzzleState {
  rngSeed: number;
  tiles: number[]; // 16 entries; 0 = blank
  moves: number;
  phase: "playing" | "done";
}

export type FifteenPuzzleAction = { type: "slide"; index: number } | { type: "reset" };

export const SOLVED: number[] = (() => {
  const a: number[] = [];
  for (let i = 1; i < N; i++) a.push(i);
  a.push(0);
  return a;
})();

export function neighborsOf(i: number): number[] {
  const r = Math.floor(i / SIZE),
    c = i % SIZE;
  const out: number[] = [];
  if (r > 0) out.push(i - SIZE);
  if (r < SIZE - 1) out.push(i + SIZE);
  if (c > 0) out.push(i - 1);
  if (c < SIZE - 1) out.push(i + 1);
  return out;
}

function shuffleSolvable(seed: number): number[] {
  // Random walks from solved guarantee solvability.
  const rng = mulberry32(seed);
  const tiles = [...SOLVED];
  let blank = tiles.indexOf(0);
  let prev = -1;
  for (let i = 0; i < 200; i++) {
    const ns = neighborsOf(blank).filter((n) => n !== prev);
    const pick = ns[Math.floor(rng() * ns.length)]!;
    [tiles[blank], tiles[pick]] = [tiles[pick]!, tiles[blank]!];
    prev = blank;
    blank = pick;
  }
  return tiles;
}

export function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < N; i++) if (tiles[i] !== SOLVED[i]) return false;
  return true;
}

export function initialState(seed: number, _s: FifteenPuzzleSettings): FifteenPuzzleState {
  return { rngSeed: seed, tiles: shuffleSolvable(seed), moves: 0, phase: "playing" };
}

export function reducer(state: FifteenPuzzleState, action: FifteenPuzzleAction): FifteenPuzzleState {
  if (action.type === "reset") {
    return { ...state, tiles: shuffleSolvable(state.rngSeed + state.moves + 1), moves: 0, phase: "playing" };
  }
  if (state.phase === "done") return state;
  if (action.type === "slide") {
    const blank = state.tiles.indexOf(0);
    if (!neighborsOf(blank).includes(action.index)) return state;
    const tiles = [...state.tiles];
    [tiles[blank], tiles[action.index]] = [tiles[action.index]!, tiles[blank]!];
    const moves = state.moves + 1;
    const phase: "playing" | "done" = isSolved(tiles) ? "done" : "playing";
    return { ...state, tiles, moves, phase };
  }
  return state;
}

export function isTerminal(state: FifteenPuzzleState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(80, 800 - state.moves * 4) };
}

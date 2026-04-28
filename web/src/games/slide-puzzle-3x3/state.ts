import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface SlidePuzzle3x3Settings { dummy: boolean; }
export interface SlidePuzzle3x3State {
  rngSeed: number;
  tiles: number[]; // 9 entries; 0 is the blank
  moves: number;
  phase: "playing" | "done";
}
export type SlidePuzzle3x3Action = { type: "slide"; index: number } | { type: "reset" };
const SOLVED = [1,2,3,4,5,6,7,8,0];
function shuffleSolvable(seed: number): number[] {
  const rng = mulberry32(seed);
  const tiles = [...SOLVED];
  // 50 random valid moves preserves solvability
  let blank = tiles.indexOf(0);
  for (let i = 0; i < 60; i++) {
    const neighbors = neighborsOf(blank);
    const pick = neighbors[Math.floor(rng() * neighbors.length)]!;
    [tiles[blank], tiles[pick]] = [tiles[pick]!, tiles[blank]!];
    blank = pick;
  }
  return tiles;
}
function neighborsOf(i: number): number[] {
  const r = Math.floor(i / 3), c = i % 3;
  const out: number[] = [];
  if (r > 0) out.push(i - 3);
  if (r < 2) out.push(i + 3);
  if (c > 0) out.push(i - 1);
  if (c < 2) out.push(i + 1);
  return out;
}
export function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < 9; i++) if (tiles[i] !== SOLVED[i]) return false;
  return true;
}
export function initialState(seed: number, _s: SlidePuzzle3x3Settings): SlidePuzzle3x3State {
  return { rngSeed: seed, tiles: shuffleSolvable(seed), moves: 0, phase: "playing" };
}
export function reducer(state: SlidePuzzle3x3State, action: SlidePuzzle3x3Action): SlidePuzzle3x3State {
  if (state.phase === "done") return state;
  if (action.type === "reset") return { ...state, tiles: shuffleSolvable(state.rngSeed + state.moves + 1), moves: 0, phase: "playing" };
  if (action.type === "slide") {
    const blank = state.tiles.indexOf(0);
    if (!neighborsOf(blank).includes(action.index)) return state;
    const tiles = [...state.tiles];
    [tiles[blank], tiles[action.index]] = [tiles[action.index]!, tiles[blank]!];
    const moves = state.moves + 1;
    const phase = isSolved(tiles) ? "done" : "playing";
    return { ...state, tiles, moves, phase };
  }
  return state;
}
export function isTerminal(state: SlidePuzzle3x3State): { score: number } | null {
  if (state.phase !== "done") return null;
  // fewer moves -> higher score
  const score = Math.max(50, 500 - state.moves * 5);
  return { score };
}

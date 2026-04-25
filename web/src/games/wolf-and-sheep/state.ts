import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Wolf and Sheep: 8x8 checkerboard. 4 sheep on dark squares of top row.
// 1 wolf anywhere on dark squares. Sheep move diagonally forward (down) only.
// Wolf moves diagonally any direction. Wolf wins by reaching top row or breaking through.
// Sheep win by trapping wolf so it has no moves.
//
// Dark squares only (r+c even for r,c in 0..7).
// We index only dark squares: 32 total.

export const BOARD = 8;

function isDark(r: number, c: number): boolean { return (r + c) % 2 === 0; }

// Map (r,c) to dark-square index 0..31
function toIdx(r: number, c: number): number {
  return (r * 4) + Math.floor(c / 2);
}
function fromIdx(i: number): [number, number] {
  const r = Math.floor(i / 4);
  const col = (i % 4) * 2 + (r % 2 === 0 ? 0 : 1);
  return [r, col];
}

export interface WolfSettings { dummy?: string; }

export interface WolfState {
  sheep: readonly number[]; // 4 sheep positions (dark-square idx)
  wolf: number;
  turn: "wolf" | "sheep";
  winner: "wolf" | "sheep" | null;
  selected: number | null; // for sheep: which sheep selected
  rngSeed: number;
  settings: WolfSettings;
}

export type WolfAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

export function initialState(seed: number, settings: WolfSettings): WolfState {
  // Sheep on top row dark squares: (0,0),(0,2),(0,4),(0,6)
  const sheep = [toIdx(0, 0), toIdx(0, 2), toIdx(0, 4), toIdx(0, 6)];
  // Wolf at bottom row center dark square: (7,1)
  const wolf = toIdx(7, 1);
  return { sheep, wolf, turn: "wolf", winner: null, selected: null, rngSeed: seed, settings };
}

function diagNeighbors(i: number, onlyDown: boolean): number[] {
  const [r, c] = fromIdx(i);
  const dirs: [number,number][] = onlyDown ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const result: number[] = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < BOARD && nc >= 0 && nc < BOARD && isDark(nr, nc)) {
      result.push(toIdx(nr, nc));
    }
  }
  return result;
}

export function getWolfMoves(state: Pick<WolfState, "wolf" | "sheep">): number[] {
  const occupied = new Set(state.sheep);
  return diagNeighbors(state.wolf, false).filter((n) => !occupied.has(n));
}

export function getSheepMoves(state: Pick<WolfState, "wolf" | "sheep">, sheepIdx: number): number[] {
  const occupied = new Set([...state.sheep, state.wolf]);
  const pos = state.sheep[sheepIdx]!;
  return diagNeighbors(pos, true).filter((n) => !occupied.has(n));
}

function wolfWins(wolf: number): boolean {
  const [r] = fromIdx(wolf);
  return r === 0;
}

function sheepWin(state: Pick<WolfState, "wolf" | "sheep">): boolean {
  return getWolfMoves(state).length === 0;
}

function botWolfMove(state: WolfState, rng: () => number): WolfState {
  const moves = getWolfMoves(state);
  if (moves.length === 0) return { ...state, winner: "sheep" };
  const rng2 = mulberry32(state.rngSeed);
  const ns = Math.floor(rng2() * 2 ** 31);
  // Greedy: prefer moves that advance toward row 0
  let best: number | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    const [mr] = fromIdx(m);
    const score = (7 - mr) + rng() * 0.1; // prefer lower row index (top)
    if (score > bestScore) { bestScore = score; best = m; }
  }
  const newWolf = best!;
  if (wolfWins(newWolf)) {
    return { ...state, rngSeed: ns, wolf: newWolf, winner: "wolf", selected: null };
  }
  return { ...state, rngSeed: ns, wolf: newWolf, turn: "sheep", selected: null };
}

export function reducer(state: WolfState, action: WolfAction): WolfState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "sheep") return state;
    const idx = state.sheep.indexOf(action.pos);
    if (idx < 0) return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.turn !== "sheep") return state;
    if (state.selected === null) return state;
    const sheepIdx = state.sheep.indexOf(state.selected);
    if (sheepIdx < 0) return state;
    const moves = getSheepMoves(state, sheepIdx);
    if (!moves.includes(action.to)) return state;
    const rng = mulberry32(state.rngSeed);
    const ns = Math.floor(rng() * 2 ** 31);
    const newSheep = [...state.sheep] as number[];
    newSheep[sheepIdx] = action.to;
    const newState: WolfState = { ...state, rngSeed: ns, sheep: newSheep, turn: "wolf", selected: null };
    if (sheepWin(newState)) {
      return { ...newState, winner: "sheep" };
    }
    // Bot plays wolf
    const rng2 = mulberry32(newState.rngSeed);
    return botWolfMove(newState, rng2);
  }

  return state;
}

export function isTerminal(state: WolfState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "sheep" ? 100 : 0 };
}

export { fromIdx, toIdx };

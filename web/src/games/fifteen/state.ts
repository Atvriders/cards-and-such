import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FifteenPuzzleSettings {
  size: "3" | "4" | "5";
  shuffleMoves: "20" | "50" | "100" | "200";
}

export interface FifteenPuzzleState {
  settings: FifteenPuzzleSettings;
  size: number;
  /** Row-major; tiles[i] = 0 means empty; otherwise 1..(size*size-1) */
  tiles: readonly number[];
  emptyIndex: number;
  movesMade: number;
  won: boolean;
  rngSeed: number;
}

export type FifteenPuzzleAction = { type: "slide"; index: number };

function isAdjacent(emptyIndex: number, index: number, size: number): boolean {
  const er = Math.floor(emptyIndex / size);
  const ec = emptyIndex % size;
  const tr = Math.floor(index / size);
  const tc = index % size;
  return (
    (er === tr && Math.abs(ec - tc) === 1) ||
    (ec === tc && Math.abs(er - tr) === 1)
  );
}

function checkWon(tiles: readonly number[], size: number): boolean {
  const total = size * size;
  for (let i = 0; i < total - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[total - 1] === 0;
}

export function initialState(seed: number, settings: FifteenPuzzleSettings): FifteenPuzzleState {
  const size = parseInt(settings.size, 10);
  const total = size * size;
  const shuffleCount = parseInt(settings.shuffleMoves, 10);
  const rng = mulberry32(seed);

  // Start from solved state
  const tiles: number[] = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
  let emptyIndex = total - 1;

  // Apply random legal slides
  for (let i = 0; i < shuffleCount; i++) {
    const er = Math.floor(emptyIndex / size);
    const ec = emptyIndex % size;
    // Neighbors of empty cell
    const neighbors: number[] = [];
    if (er > 0) neighbors.push((er - 1) * size + ec);
    if (er < size - 1) neighbors.push((er + 1) * size + ec);
    if (ec > 0) neighbors.push(er * size + (ec - 1));
    if (ec < size - 1) neighbors.push(er * size + (ec + 1));

    const chosen = neighbors[Math.floor(rng() * neighbors.length)]!;
    // Swap chosen tile with empty
    tiles[emptyIndex] = tiles[chosen]!;
    tiles[chosen] = 0;
    emptyIndex = chosen;
  }

  return {
    settings,
    size,
    tiles,
    emptyIndex,
    movesMade: 0,
    won: false,
    rngSeed: seed,
  };
}

export function reducer(state: FifteenPuzzleState, action: FifteenPuzzleAction): FifteenPuzzleState {
  if (action.type !== "slide") return state;
  if (state.won) return state;

  const { index } = action;
  const { emptyIndex, size } = state;

  if (!isAdjacent(emptyIndex, index, size)) return state;

  const newTiles = state.tiles.slice();
  newTiles[emptyIndex] = newTiles[index]!;
  newTiles[index] = 0;

  const won = checkWon(newTiles, size);

  return {
    ...state,
    tiles: newTiles,
    emptyIndex: index,
    movesMade: state.movesMade + 1,
    won,
  };
}

export function isTerminal(state: FifteenPuzzleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 1000 - state.movesMade) };
}

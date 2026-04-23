import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { TTPuzzle, TrackTile } from "./puzzles.js";

export type { TTPuzzle, TrackTile };

export interface TTSettings {
  difficulty: "easy" | "medium";
}

export interface TTState {
  settings: TTSettings;
  puzzle: TTPuzzle;
  /** Player-placed tiles; undefined = not placed; mirrors revealed for pre-fills */
  tiles: (TrackTile | null | undefined)[];
  selectedTile: TrackTile;
  won: boolean;
  moves: number;
}

export type TTAction =
  | { type: "selectTile"; tile: TrackTile }
  | { type: "placeTile"; idx: number }
  | { type: "clearTile"; idx: number }
  | { type: "reset" };

export const ALL_TILES: TrackTile[] = ["H", "V", "NE", "NW", "SE", "SW"];

export function computeRowCounts(size: number, tiles: (TrackTile | null | undefined)[]): number[] {
  return Array.from({ length: size }, (_, r) => {
    let count = 0;
    for (let c = 0; c < size; c++) {
      const t = tiles[r * size + c];
      if (t !== null && t !== undefined) count++;
    }
    return count;
  });
}

export function computeColCounts(size: number, tiles: (TrackTile | null | undefined)[]): number[] {
  return Array.from({ length: size }, (_, c) => {
    let count = 0;
    for (let r = 0; r < size; r++) {
      const t = tiles[r * size + c];
      if (t !== null && t !== undefined) count++;
    }
    return count;
  });
}

export function checkWon(puzzle: TTPuzzle, tiles: (TrackTile | null | undefined)[]): boolean {
  const { size, solution } = puzzle;
  for (let i = 0; i < size * size; i++) {
    const t = tiles[i];
    const s = solution[i];
    // Treat undefined as null
    const tv = t === undefined ? null : t;
    if (tv !== s) return false;
  }
  return true;
}

export function initialState(seed: number, settings: TTSettings): TTState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    tiles: puzzle.revealed.slice(),
    selectedTile: "H",
    won: false,
    moves: 0,
  };
}

export function reducer(state: TTState, action: TTAction): TTState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectTile":
      return { ...state, selectedTile: action.tile };
    case "placeTile": {
      const { idx } = action;
      if (state.puzzle.revealed[idx] !== undefined) return state; // pre-revealed
      const newTiles = state.tiles.slice();
      newTiles[idx] = state.selectedTile;
      const won = checkWon(state.puzzle, newTiles);
      return { ...state, tiles: newTiles, won, moves: state.moves + 1 };
    }
    case "clearTile": {
      const { idx } = action;
      if (state.puzzle.revealed[idx] !== undefined) return state;
      const newTiles = state.tiles.slice();
      newTiles[idx] = undefined;
      return { ...state, tiles: newTiles, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, tiles: state.puzzle.revealed.slice(), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: TTState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}

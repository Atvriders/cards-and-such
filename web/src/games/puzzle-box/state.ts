import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PuzzleBoxSettings {
  shuffleMoves: "20" | "50" | "100";
  theme: "numbers" | "emoji" | "colors";
}

export interface PuzzleBoxState {
  settings: PuzzleBoxSettings;
  rngSeed: number;
  tiles: readonly number[];  // 9 tiles, 0=blank; positions 0-8
  emptyIndex: number;
  movesMade: number;
  won: boolean;
}

export type PuzzleBoxAction =
  | { type: "slide"; index: number }
  | { type: "restart" };

// Tile content for each theme (tile 1–8, index 0=blank)
export const TILE_THEMES: Record<string, string[]> = {
  numbers: ["", "1", "2", "3", "4", "5", "6", "7", "8"],
  emoji: ["", "🐱", "🐶", "🐸", "🦊", "🐼", "🐨", "🦁", "🐯"],
  colors: ["", "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c", "#e91e63"],
};

function isAdjacent(a: number, b: number): boolean {
  const ar = Math.floor(a / 3), ac = a % 3;
  const br = Math.floor(b / 3), bc = b % 3;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

function isSolved(tiles: readonly number[]): boolean {
  for (let i = 0; i < 8; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[8] === 0;
}

export function initialState(seed: number, settings: PuzzleBoxSettings): PuzzleBoxState {
  const rng = mulberry32(seed >>> 0);
  const shuffleCount = parseInt(settings.shuffleMoves, 10);

  // Start solved: [1,2,3,4,5,6,7,8,0]
  const tiles: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let emptyIndex = 8;

  // Shuffle via legal moves
  let lastEmpty = -1;
  for (let i = 0; i < shuffleCount; i++) {
    const neighbors: number[] = [];
    for (let j = 0; j < 9; j++) {
      if (j !== emptyIndex && j !== lastEmpty && isAdjacent(emptyIndex, j)) {
        neighbors.push(j);
      }
    }
    if (neighbors.length === 0) continue;
    const chosen = neighbors[Math.floor(rng() * neighbors.length)]!;
    lastEmpty = emptyIndex;
    tiles[emptyIndex] = tiles[chosen]!;
    tiles[chosen] = 0;
    emptyIndex = chosen;
  }

  return {
    settings,
    rngSeed: seed >>> 0,
    tiles,
    emptyIndex,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: PuzzleBoxState, action: PuzzleBoxAction): PuzzleBoxState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }
  if (state.won) return state;
  if (action.type !== "slide") return state;

  const { index } = action;
  if (!isAdjacent(index, state.emptyIndex)) return state;

  const tiles = [...state.tiles];
  tiles[state.emptyIndex] = tiles[index]!;
  tiles[index] = 0;
  const won = isSolved(tiles);

  return {
    ...state,
    tiles,
    emptyIndex: index,
    movesMade: state.movesMade + 1,
    won,
  };
}

export function isTerminal(state: PuzzleBoxState): { score: number } | null {
  if (!state.won) return null;
  const bonus = Math.max(0, 500 - state.movesMade * 5);
  return { score: 500 + bonus };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Klotski — sliding-block puzzle on a 4×5 grid.
// The "goal" block (2×2) must be moved to the exit at bottom-center.
// Blocks of varying sizes slide without overlapping.

export interface KlotskiSettings {
  layout: "red-donkey" | "easy" | "medium";
}

// A block: id, row, col, width, height
export interface Block {
  id: number;
  row: number;
  col: number;
  w: number;
  h: number;
}

export interface KlotskiState {
  settings: KlotskiSettings;
  blocks: readonly Block[];
  moves: number;
  won: boolean;
  selectedId: number | null;
}

export type KlotskiAction =
  | { type: "select"; id: number }
  | { type: "move"; id: number; dr: number; dc: number };

// Classic "Red Donkey" / L'Âne Rouge layout (4×5 grid)
// Block 0 is the 2×2 goal block
const RED_DONKEY: Block[] = [
  { id: 0, row: 0, col: 1, w: 2, h: 2 }, // Goal (2×2)
  { id: 1, row: 0, col: 0, w: 1, h: 2 }, // vertical 1×2
  { id: 2, row: 0, col: 3, w: 1, h: 2 }, // vertical 1×2
  { id: 3, row: 2, col: 1, w: 2, h: 1 }, // horizontal 2×1
  { id: 4, row: 2, col: 0, w: 1, h: 2 }, // vertical 1×2
  { id: 5, row: 2, col: 3, w: 1, h: 2 }, // vertical 1×2
  { id: 6, row: 3, col: 1, w: 1, h: 1 }, // 1×1
  { id: 7, row: 3, col: 2, w: 1, h: 1 }, // 1×1
  { id: 8, row: 4, col: 1, w: 1, h: 1 }, // 1×1
  { id: 9, row: 4, col: 2, w: 1, h: 1 }, // 1×1
];

const EASY_LAYOUT: Block[] = [
  { id: 0, row: 0, col: 1, w: 2, h: 2 },
  { id: 1, row: 0, col: 0, w: 1, h: 2 },
  { id: 2, row: 0, col: 3, w: 1, h: 2 },
  { id: 3, row: 2, col: 0, w: 4, h: 1 },
  { id: 4, row: 3, col: 0, w: 1, h: 1 },
  { id: 5, row: 3, col: 3, w: 1, h: 1 },
  { id: 6, row: 4, col: 0, w: 1, h: 1 },
  { id: 7, row: 4, col: 3, w: 1, h: 1 },
];

const MEDIUM_LAYOUT: Block[] = [
  { id: 0, row: 0, col: 1, w: 2, h: 2 },
  { id: 1, row: 0, col: 0, w: 1, h: 3 },
  { id: 2, row: 0, col: 3, w: 1, h: 3 },
  { id: 3, row: 2, col: 1, w: 1, h: 2 },
  { id: 4, row: 2, col: 2, w: 1, h: 2 },
  { id: 5, row: 3, col: 0, w: 1, h: 1 },
  { id: 6, row: 3, col: 3, w: 1, h: 1 },
  { id: 7, row: 4, col: 0, w: 2, h: 1 },
  { id: 8, row: 4, col: 2, w: 2, h: 1 },
];

const COLS = 4;
const ROWS = 5;

function getLayout(layout: KlotskiSettings["layout"]): Block[] {
  if (layout === "red-donkey") return RED_DONKEY.map((b) => ({ ...b }));
  if (layout === "easy") return EASY_LAYOUT.map((b) => ({ ...b }));
  return MEDIUM_LAYOUT.map((b) => ({ ...b }));
}

// Build occupancy grid: which block id occupies each cell (-1 = empty)
export function buildGrid(blocks: readonly Block[]): number[][] {
  const grid: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(-1));
  for (const b of blocks) {
    for (let r = b.row; r < b.row + b.h; r++) {
      for (let c = b.col; c < b.col + b.w; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          grid[r]![c] = b.id;
        }
      }
    }
  }
  return grid;
}

export function canMove(blocks: readonly Block[], id: number, dr: number, dc: number): boolean {
  const b = blocks.find((x) => x.id === id);
  if (!b) return false;
  const nr = b.row + dr;
  const nc = b.col + dc;
  if (nr < 0 || nc < 0 || nr + b.h > ROWS || nc + b.w > COLS) return false;
  const grid = buildGrid(blocks);
  // Clear current block's cells
  for (let r = b.row; r < b.row + b.h; r++)
    for (let c = b.col; c < b.col + b.w; c++)
      grid[r]![c] = -1;
  // Check new position
  for (let r = nr; r < nr + b.h; r++)
    for (let c = nc; c < nc + b.w; c++)
      if (grid[r]![c] !== -1) return false;
  return true;
}

export function initialState(seed: number, settings: KlotskiSettings): KlotskiState {
  void mulberry32(seed);
  return {
    settings,
    blocks: getLayout(settings.layout),
    moves: 0,
    won: false,
    selectedId: null,
  };
}

// Win: goal block (id=0) is at row 3, col 1 (the exit position)
export function checkWin(blocks: readonly Block[]): boolean {
  const goal = blocks.find((b) => b.id === 0);
  return goal !== undefined && goal.row === 3 && goal.col === 1;
}

export function reducer(state: KlotskiState, action: KlotskiAction): KlotskiState {
  if (state.won) return state;

  if (action.type === "select") {
    const { id } = action;
    if (state.selectedId === id) return { ...state, selectedId: null };
    return { ...state, selectedId: id };
  }

  if (action.type === "move") {
    const { id, dr, dc } = action;
    if (!canMove(state.blocks, id, dr, dc)) return state;
    const newBlocks = state.blocks.map((b) =>
      b.id === id ? { ...b, row: b.row + dr, col: b.col + dc } : b
    );
    const won = checkWin(newBlocks);
    return { ...state, blocks: newBlocks, moves: state.moves + 1, won, selectedId: won ? null : state.selectedId };
  }

  return state;
}

export function isTerminal(state: KlotskiState): { score: number } | null {
  if (!state.won) return null;
  // Fewer moves = better score. Par ~100 moves.
  return { score: Math.max(10, 500 - state.moves * 2) };
}

export const GOAL_ID = 0;
export const BOARD_ROWS = ROWS;
export const BOARD_COLS = COLS;

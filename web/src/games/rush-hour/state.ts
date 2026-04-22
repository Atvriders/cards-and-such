import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { RUSH_PUZZLES } from "./puzzles.js";
import type { Block } from "./puzzles.js";

export type { Block };

export interface RushHourSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface RushHourState {
  blocks: Block[];
  selected: string | null; // block id
  moves: number;
  won: boolean;
  settings: RushHourSettings;
}

export type RushHourAction =
  | { type: "select"; id: string | null }
  | { type: "move"; id: string; delta: number }; // delta in cells along orientation

/** Build the 6×6 occupancy grid; returns map of "r,c" -> blockId */
export function buildGrid(blocks: Block[]): Map<string, string> {
  const grid = new Map<string, string>();
  for (const b of blocks) {
    for (let i = 0; i < b.length; i++) {
      const r = b.orientation === "v" ? b.row + i : b.row;
      const c = b.orientation === "h" ? b.col + i : b.col;
      grid.set(`${r},${c}`, b.id);
    }
  }
  return grid;
}

export function canMove(blocks: Block[], id: string, delta: number): boolean {
  if (delta === 0) return false;
  const block = blocks.find((b) => b.id === id);
  if (!block) return false;
  const grid = buildGrid(blocks);

  // Remove this block from grid for checking
  for (let i = 0; i < block.length; i++) {
    const r = block.orientation === "v" ? block.row + i : block.row;
    const c = block.orientation === "h" ? block.col + i : block.col;
    grid.delete(`${r},${c}`);
  }

  if (block.orientation === "h") {
    if (delta > 0) {
      // Moving right: check cells from col+length to col+length+delta-1
      for (let d = 1; d <= delta; d++) {
        const c = block.col + block.length - 1 + d;
        if (c >= 6) return false;
        if (grid.has(`${block.row},${c}`)) return false;
      }
    } else {
      // Moving left
      for (let d = 1; d <= -delta; d++) {
        const c = block.col - d;
        if (c < 0) return false;
        if (grid.has(`${block.row},${c}`)) return false;
      }
    }
  } else {
    if (delta > 0) {
      for (let d = 1; d <= delta; d++) {
        const r = block.row + block.length - 1 + d;
        if (r >= 6) return false;
        if (grid.has(`${r},${block.col}`)) return false;
      }
    } else {
      for (let d = 1; d <= -delta; d++) {
        const r = block.row - d;
        if (r < 0) return false;
        if (grid.has(`${r},${block.col}`)) return false;
      }
    }
  }
  return true;
}

function applyMove(blocks: Block[], id: string, delta: number): Block[] {
  return blocks.map((b) => {
    if (b.id !== id) return b;
    if (b.orientation === "h") return { ...b, col: b.col + delta };
    return { ...b, row: b.row + delta };
  });
}

function checkWon(blocks: Block[]): boolean {
  const player = blocks.find((b) => b.isPlayer);
  if (!player) return false;
  // Player is horizontal at row 2; exit is at col 4 (right edge for length-2 car)
  return player.col + player.length >= 6;
}

/** Validate that no two blocks overlap */
export function validateBlocks(blocks: Block[]): boolean {
  const seen = new Set<string>();
  for (const b of blocks) {
    for (let i = 0; i < b.length; i++) {
      const r = b.orientation === "v" ? b.row + i : b.row;
      const c = b.orientation === "h" ? b.col + i : b.col;
      if (r < 0 || r >= 6 || c < 0 || c >= 6) return false;
      const key = `${r},${c}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
  }
  return true;
}

export function initialState(seed: number, settings: RushHourSettings): RushHourState {
  const rng = mulberry32(seed);
  const pool = RUSH_PUZZLES.filter((p) => p.difficulty === settings.difficulty);
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    blocks: puzzle.blocks.map((b) => ({ ...b })),
    selected: null,
    moves: 0,
    won: false,
    settings,
  };
}

export function reducer(state: RushHourState, action: RushHourAction): RushHourState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.id };
    case "move": {
      const { id, delta } = action;
      if (!canMove(state.blocks, id, delta)) return state;
      const blocks = applyMove(state.blocks, id, delta);
      const won = checkWon(blocks);
      return { ...state, blocks, moves: state.moves + 1, won, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RushHourState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 500 - state.moves * 10) };
}

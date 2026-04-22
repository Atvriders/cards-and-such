/** Pre-designed Rush Hour puzzles. 6×6 grid, 0-indexed. */

export interface Block {
  id: string;
  orientation: "h" | "v";
  row: number;
  col: number;
  length: 2 | 3;
  isPlayer?: boolean; // the red car
}

export interface RushPuzzle {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  blocks: Block[];
}

export const RUSH_PUZZLES: RushPuzzle[] = [
  // ── EASY ──────────────────────────────────────────────────────────────
  {
    id: "easy-1",
    difficulty: "easy",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 2, length: 2 },
      { id: "b", orientation: "h", row: 0, col: 3, length: 2 },
    ],
  },
  {
    id: "easy-2",
    difficulty: "easy",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 1, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 0, length: 3 },
      { id: "b", orientation: "h", row: 3, col: 2, length: 2 },
      { id: "c", orientation: "v", row: 1, col: 3, length: 2 },
    ],
  },
  {
    id: "easy-3",
    difficulty: "easy",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 2, length: 3 },
      { id: "b", orientation: "h", row: 1, col: 3, length: 2 },
      { id: "c", orientation: "h", row: 4, col: 3, length: 2 },
    ],
  },
  {
    id: "easy-4",
    difficulty: "easy",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "h", row: 0, col: 0, length: 2 },
      { id: "b", orientation: "v", row: 0, col: 2, length: 2 },
      { id: "c", orientation: "h", row: 3, col: 3, length: 2 },
    ],
  },
  // ── MEDIUM ──────────────────────────────────────────────────────────────
  {
    id: "medium-1",
    difficulty: "medium",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 2, length: 3 },
      { id: "b", orientation: "h", row: 0, col: 3, length: 3 },
      { id: "c", orientation: "h", row: 3, col: 2, length: 2 },
      { id: "d", orientation: "h", row: 3, col: 0, length: 2 },
      { id: "e", orientation: "v", row: 4, col: 2, length: 2 },
      { id: "f", orientation: "h", row: 5, col: 3, length: 3 },
    ],
  },
  {
    id: "medium-2",
    difficulty: "medium",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 1, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 0, length: 3 },
      { id: "b", orientation: "h", row: 0, col: 1, length: 2 },
      { id: "c", orientation: "v", row: 0, col: 3, length: 2 },
      { id: "d", orientation: "h", row: 1, col: 4, length: 2 },
      { id: "e", orientation: "v", row: 2, col: 3, length: 3 },
      { id: "f", orientation: "h", row: 3, col: 0, length: 3 },
      { id: "g", orientation: "v", row: 4, col: 4, length: 2 },
    ],
  },
  {
    id: "medium-3",
    difficulty: "medium",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "h", row: 0, col: 0, length: 2 },
      { id: "b", orientation: "v", row: 0, col: 2, length: 3 },
      { id: "c", orientation: "h", row: 0, col: 3, length: 2 },
      { id: "d", orientation: "v", row: 1, col: 5, length: 3 },
      { id: "e", orientation: "h", row: 3, col: 2, length: 2 },
      { id: "f", orientation: "v", row: 3, col: 4, length: 2 },
      { id: "g", orientation: "h", row: 4, col: 0, length: 3 },
      { id: "h", orientation: "h", row: 5, col: 3, length: 3 },
    ],
  },
  // ── HARD ──────────────────────────────────────────────────────────────
  {
    id: "hard-1",
    difficulty: "hard",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 0, length: 2, isPlayer: true },
      { id: "a", orientation: "v", row: 0, col: 2, length: 3 },
      { id: "b", orientation: "h", row: 0, col: 0, length: 2 },
      { id: "c", orientation: "v", row: 0, col: 3, length: 2 },
      { id: "d", orientation: "h", row: 0, col: 4, length: 2 },
      { id: "e", orientation: "h", row: 1, col: 4, length: 2 },
      { id: "f", orientation: "h", row: 2, col: 3, length: 3 },
      { id: "g", orientation: "v", row: 3, col: 0, length: 2 },
      { id: "h", orientation: "h", row: 3, col: 1, length: 3 },
      { id: "i", orientation: "v", row: 3, col: 4, length: 2 },
      { id: "j", orientation: "h", row: 4, col: 1, length: 3 },
      { id: "k", orientation: "h", row: 5, col: 0, length: 3 },
    ],
  },
  {
    id: "hard-2",
    difficulty: "hard",
    blocks: [
      { id: "player", orientation: "h", row: 2, col: 1, length: 2, isPlayer: true },
      { id: "a", orientation: "h", row: 0, col: 0, length: 3 },
      { id: "b", orientation: "v", row: 0, col: 3, length: 3 },
      { id: "c", orientation: "h", row: 0, col: 4, length: 2 },
      { id: "d", orientation: "v", row: 1, col: 0, length: 2 },
      { id: "e", orientation: "h", row: 1, col: 1, length: 2 },
      { id: "f", orientation: "v", row: 1, col: 5, length: 2 },
      { id: "g", orientation: "v", row: 2, col: 4, length: 3 },
      { id: "h", orientation: "v", row: 3, col: 1, length: 3 },
      { id: "i", orientation: "h", row: 3, col: 2, length: 2 },
      { id: "j", orientation: "v", row: 3, col: 5, length: 3 },
      { id: "k", orientation: "h", row: 4, col: 2, length: 2 },
      { id: "l", orientation: "h", row: 5, col: 2, length: 3 },
      { id: "m", orientation: "v", row: 4, col: 0, length: 2 },
    ],
  },
];

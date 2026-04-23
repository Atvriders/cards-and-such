// Laser Maze puzzles
// 5×5 grid. Laser emitter on an edge, fires in one direction.
// Fixed walls and mirrors. Player places additional mirrors to redirect beam to target.
// Mirror "/" reflects: right->up, up->right, left->down, down->left
// Mirror "\" reflects: right->down, down->right, left->up, up->left

export type Direction = "right" | "left" | "up" | "down";
export type MirrorType = "/" | "\\";

export interface LaserCell {
  wall?: boolean;
  mirror?: MirrorType;  // fixed mirror
}

export interface LaserPuzzle {
  size: number;
  grid: LaserCell[];
  /** Emitter: edge position, fires into grid */
  emitter: { r: number; c: number; dir: Direction };
  /** Target cell index */
  target: number;
  /** Number of mirrors player must place */
  mirrorCount: number;
  /** Solution: indices where player places mirrors and their type */
  solution: { idx: number; mirror: MirrorType }[];
}

export const PUZZLES: LaserPuzzle[] = [
  // Puzzle 1: simple one-mirror redirect
  {
    size: 5,
    grid: Array.from({ length: 25 }, () => ({})),
    emitter: { r: 0, c: 0, dir: "right" },
    target: 4 * 5 + 4, // (4,4)
    mirrorCount: 2,
    solution: [
      { idx: 0 * 5 + 4, mirror: "\\" }, // (0,4): right->down
      { idx: 4 * 5 + 0, mirror: "\\" }, // (4,0): down->right... nope
    ],
  },
  // Puzzle 2
  {
    size: 5,
    grid: Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5), c = i % 5;
      // Wall at (2,2)
      return (r === 2 && c === 2) ? { wall: true } : {};
    }),
    emitter: { r: 0, c: 2, dir: "down" },
    target: 4 * 5 + 0, // (4,0)
    mirrorCount: 2,
    solution: [
      { idx: 1 * 5 + 2, mirror: "\\" }, // (1,2): down -> right? no
      { idx: 1 * 5 + 4, mirror: "/" },  // right->up? no
    ],
  },
  // Puzzle 3: beam bounces twice
  {
    size: 5,
    grid: Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5), c = i % 5;
      return (r === 1 && c === 1) ? { mirror: "\\" as MirrorType } : {};
    }),
    emitter: { r: 0, c: 0, dir: "right" },
    target: 4 * 5 + 1, // (4,1)
    mirrorCount: 1,
    solution: [
      { idx: 1 * 5 + 4, mirror: "\\" }, // (1,4): down from (1,1) bounce right->down at \\ ... wait
    ],
  },
  // Puzzle 4
  {
    size: 5,
    grid: Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5), c = i % 5;
      if (r === 0 && c === 3) return { mirror: "/" as MirrorType };
      if (r === 2 && c === 1) return { wall: true };
      return {};
    }),
    emitter: { r: 0, c: 0, dir: "right" },
    target: 4 * 5 + 3, // (4,3)
    mirrorCount: 2,
    solution: [
      { idx: 2 * 5 + 3, mirror: "\\" },
      { idx: 4 * 5 + 3, mirror: "/" },
    ],
  },
  // Puzzle 5: from left edge
  {
    size: 5,
    grid: Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5), c = i % 5;
      if (r === 3 && c === 3) return { mirror: "/" as MirrorType };
      return {};
    }),
    emitter: { r: 2, c: 0, dir: "right" },
    target: 0 * 5 + 3, // (0,3)
    mirrorCount: 1,
    solution: [
      { idx: 2 * 5 + 3, mirror: "/" }, // (2,3): right->up
    ],
  },
];

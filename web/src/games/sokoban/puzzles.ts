/** Sokoban level definitions stored as ASCII strings.
 *  # = wall, . = floor, @ = player on floor, + = player on target,
 *  $ = crate on floor, * = crate on target, space = void/wall
 */

export interface SokobanLevel {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  /** ASCII art, rows separated by newlines */
  ascii: string;
  parMoves: number;
}

export const SOKOBAN_LEVELS: SokobanLevel[] = [
  // ── EASY ──────────────────────────────────────────────────────────────
  {
    id: "easy-1",
    difficulty: "easy",
    parMoves: 8,
    ascii: [
      "#####",
      "#@$.#",
      "#####",
    ].join("\n"),
  },
  {
    id: "easy-2",
    difficulty: "easy",
    parMoves: 12,
    ascii: [
      "#####",
      "#.  #",
      "#$  #",
      "#@  #",
      "#####",
    ].join("\n"),
  },
  {
    id: "easy-3",
    difficulty: "easy",
    parMoves: 10,
    ascii: [
      "#######",
      "#     #",
      "# $@. #",
      "#     #",
      "#######",
    ].join("\n"),
  },
  {
    id: "easy-4",
    difficulty: "easy",
    parMoves: 14,
    ascii: [
      "#####",
      "#.  #",
      "#.  #",
      "#$$ #",
      "# @ #",
      "#####",
    ].join("\n"),
  },
  // ── MEDIUM ──────────────────────────────────────────────────────────────
  {
    id: "medium-1",
    difficulty: "medium",
    parMoves: 20,
    ascii: [
      "#######",
      "#.    #",
      "#. $  #",
      "## $@ #",
      " #.####",
      " #  #  ",
      " ####  ",
    ].join("\n"),
  },
  {
    id: "medium-2",
    difficulty: "medium",
    parMoves: 25,
    ascii: [
      "  #####",
      "###   #",
      "#.$ @ #",
      "###$  #",
      "#.   ##",
      "#  ###",
      "####",
    ].join("\n"),
  },
  {
    id: "medium-3",
    difficulty: "medium",
    parMoves: 22,
    ascii: [
      "#######",
      "#     #",
      "# .$. #",
      "# $@$ #",
      "# .$. #",
      "#     #",
      "#######",
    ].join("\n"),
  },
  {
    id: "medium-4",
    difficulty: "medium",
    parMoves: 30,
    ascii: [
      "######",
      "#    #",
      "# $. #",
      "#.$@##",
      "# .$ #",
      "#    #",
      "######",
    ].join("\n"),
  },
  // ── HARD ──────────────────────────────────────────────────────────────
  {
    id: "hard-1",
    difficulty: "hard",
    parMoves: 45,
    ascii: [
      "#######",
      "#  @  #",
      "# $$$ #",
      "# . . #",
      "# . . #",
      "#     #",
      "#######",
    ].join("\n"),
  },
  {
    id: "hard-2",
    difficulty: "hard",
    parMoves: 50,
    ascii: [
      "########",
      "#  @   #",
      "# $$$  #",
      "# .  . #",
      "#   $  #",
      "# . .  #",
      "########",
    ].join("\n"),
  },
  {
    id: "hard-3",
    difficulty: "hard",
    parMoves: 60,
    ascii: [
      "########",
      "# @    #",
      "# $$$$ #",
      "# .  . #",
      "# .  . #",
      "#      #",
      "########",
    ].join("\n"),
  },
];

export type CellType = "wall" | "floor" | "target" | "void";

export interface ParsedLevel {
  width: number;
  height: number;
  grid: CellType[][];
  playerPos: [number, number];
  crates: [number, number][];
  targets: [number, number][];
}

export function parseLevel(level: SokobanLevel): ParsedLevel {
  const rows = level.ascii.split("\n");
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const grid: CellType[][] = [];
  let playerPos: [number, number] = [0, 0];
  const crates: [number, number][] = [];
  const targets: [number, number][] = [];

  for (let r = 0; r < height; r++) {
    grid[r] = [];
    const row = rows[r]!;
    for (let c = 0; c < width; c++) {
      const ch = row[c] ?? " ";
      switch (ch) {
        case "#":
          grid[r]![c] = "wall";
          break;
        case " ":
          grid[r]![c] = "void";
          break;
        case ".":
          grid[r]![c] = "target";
          targets.push([r, c]);
          break;
        case "@":
          grid[r]![c] = "floor";
          playerPos = [r, c];
          break;
        case "+":
          grid[r]![c] = "target";
          playerPos = [r, c];
          targets.push([r, c]);
          break;
        case "$":
          grid[r]![c] = "floor";
          crates.push([r, c]);
          break;
        case "*":
          grid[r]![c] = "target";
          crates.push([r, c]);
          targets.push([r, c]);
          break;
        default:
          grid[r]![c] = "floor";
      }
    }
  }

  return { width, height, grid, playerPos, crates, targets };
}

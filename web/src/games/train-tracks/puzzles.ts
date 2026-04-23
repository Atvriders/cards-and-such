// Train Tracks puzzles
// A single continuous rail path connects a fixed entry and exit on the grid border.
// Row/col clues count how many cells in that line contain track.
// Some cells are pre-revealed with their track tile.

// Track tile types (which sides are connected):
// "H" = horizontal (left-right)
// "V" = vertical (up-down)
// "NE" = curves connecting north-east (up-right)
// "NW" = curves connecting north-west (up-left)
// "SE" = curves connecting south-east (down-right)
// "SW" = curves connecting south-west (down-left)
// null = empty (no track)

export type TrackTile = "H" | "V" | "NE" | "NW" | "SE" | "SW";

export interface TTPuzzle {
  size: number;
  rowClues: number[];
  colClues: number[];
  /** entry: {row, col, from: "N"|"S"|"E"|"W"} */
  entry: { row: number; col: number; from: "N" | "S" | "E" | "W" };
  /** exit: similar */
  exit: { row: number; col: number; from: "N" | "S" | "E" | "W" };
  /** Pre-revealed tiles; null = empty, undefined = unknown */
  revealed: (TrackTile | null | undefined)[];
  /** Full solution */
  solution: (TrackTile | null)[];
}

// Which directions does a tile connect?
export function tileDirs(t: TrackTile): string[] {
  switch (t) {
    case "H":  return ["W", "E"];
    case "V":  return ["N", "S"];
    case "NE": return ["N", "E"];
    case "NW": return ["N", "W"];
    case "SE": return ["S", "E"];
    case "SW": return ["S", "W"];
  }
}

function makePuzzle(
  size: number,
  sol: (TrackTile | null)[],
  entry: TTPuzzle["entry"],
  exit_: TTPuzzle["exit"],
  revealIdx: number[]
): TTPuzzle {
  const rowClues = Array.from({ length: size }, (_, r) => {
    let count = 0;
    for (let c = 0; c < size; c++) { if (sol[r * size + c] !== null) count++; }
    return count;
  });
  const colClues = Array.from({ length: size }, (_, c) => {
    let count = 0;
    for (let r = 0; r < size; r++) { if (sol[r * size + c] !== null) count++; }
    return count;
  });
  const revealed: (TrackTile | null | undefined)[] = new Array(size * size).fill(undefined);
  for (const i of revealIdx) revealed[i] = sol[i]!;
  return { size, rowClues, colClues, entry, exit: exit_, revealed, solution: sol };
}

function g(size: number, ...cells: [number, number, TrackTile | null][]): (TrackTile | null)[] {
  const sol: (TrackTile | null)[] = new Array(size * size).fill(null);
  for (const [r, c, t] of cells) sol[r * size + c] = t;
  return sol;
}

// 5×5 puzzles
export const PUZZLES_EASY: TTPuzzle[] = [
  // Path: entry W on row 0, exit E on row 4
  // (0,0)H,(0,1)H,(0,2)SE,(1,2)SW,(1,1)H,(1,0)SE — no, keep it simple
  // Simple snake: row0: (0,0)SE; col0 down; row4 right; exit E row4
  // entry W row0, exit E row4
  // (0,0)SE, (1,0)V, (2,0)NE, (2,1)H, (2,2)H, (2,3)SW, (3,3)V, (4,3)NE, (4,4)H exit
  makePuzzle(5,
    g(5,
      [0,0,"SE"],[1,0,"V"],[2,0,"NE"],[2,1,"H"],[2,2,"H"],[2,3,"SW"],[3,3,"V"],[4,3,"NE"],[4,4,"H"]
    ),
    { row: 0, col: 0, from: "W" },
    { row: 4, col: 4, from: "E" },
    [0, 10, 14, 23]
  ),
  // Another 5×5
  // entry N row 0 col 2, exit S row 4 col 2
  // (0,2)V,(1,2)NW,(1,1)H,(1,0)SW,(2,0)V,(3,0)NE,(3,1)H,(3,2)H,(3,3)SW,(4,3)V exit?
  // entry N col2, exit S col4
  makePuzzle(5,
    g(5,
      [0,2,"V"],[1,2,"NW"],[1,1,"H"],[1,0,"SW"],[2,0,"V"],[3,0,"NE"],[3,1,"H"],[3,2,"H"],[3,3,"H"],[3,4,"V"],[4,4,"V"]
    ),
    { row: 0, col: 2, from: "N" },
    { row: 4, col: 4, from: "S" },
    [2, 5, 15, 24]
  ),
];

// 6×6 puzzles
export const PUZZLES_MEDIUM: TTPuzzle[] = [
  makePuzzle(6,
    g(6,
      [0,0,"SE"],[0,1,"H"],[0,2,"H"],[0,3,"SW"],
      [1,0,"V"],[1,3,"V"],
      [2,0,"NE"],[2,1,"H"],[2,2,"H"],[2,3,"NW"],
      [3,3,"SE"],[3,4,"H"],[3,5,"SW"],
      [4,3,"V"],[4,5,"V"],
      [5,3,"NE"],[5,4,"H"],[5,5,"NW"]
    ),
    { row: 0, col: 0, from: "W" },
    { row: 5, col: 5, from: "E" },
    [0, 9, 21, 33]
  ),
];

// Tapa puzzles
// Shade cells such that:
// - All shaded cells form one connected group
// - No 2×2 block is all shaded
// - Clue cells (not shaded) show groups of consecutive shaded cells in their 8 neighbors

export interface TapaClue {
  r: number;
  c: number;
  groups: number[]; // sorted descending, e.g. [3,1] means groups of size 3 and 1
}

export interface TapaPuzzle {
  size: number;
  clues: TapaClue[];
  /** true = shaded */
  solution: boolean[];
}

function makeTapa(size: number, clues: TapaClue[], shadedIdxs: number[]): TapaPuzzle {
  const solution = new Array(size * size).fill(false);
  for (const i of shadedIdxs) solution[i] = true;
  return { size, clues, solution };
}

const I = (r: number, c: number, N: number) => r * N + c;

// 6×6 easy puzzles
// Clue values describe groups of consecutive shaded cells in the 8 neighbors
export const PUZZLES_EASY: TapaPuzzle[] = [
  // E1: border shading (full border), interior all white
  // Clue cells in interior with their neighbor counts
  makeTapa(6,
    [
      // (1,1): 8 neighbors = (0,0),(0,1),(0,2),(1,0),(1,2),(2,0),(2,1),(2,2)
      // Shaded neighbors on border: (0,0),(0,1),(0,2),(1,0),(2,0),(2,1) - let's see
      // Actually full border means: (0,0)=shaded,(0,1)=shaded,(0,2)=shaded,(1,0)=shaded,(1,2)=white? No (1,2) interior.
      // So neighbors of (1,1): (0,0)S,(0,1)S,(0,2)S,(1,0)S,(1,2)W,(2,0)S,(2,1)S,(2,2)W
      // Shaded: positions 0,1,2,3,5,6 in clockwise: (0,0)S,(0,1)S,(0,2)S,(1,2)W,(2,2)W,(2,1)S,(2,0)S,(1,0)S
      // Groups (clockwise): S,S,S,_,_,S,S,S → group of 3 at top, group of 3 at bottom-left (3,3) but they connect via wrap?
      // In Tapa, neighbors are counted clockwise. Let's use: [3,3]? or [5,1]?
      // Going clockwise from top-left: (0,0)S,(0,1)S,(0,2)S,(1,2)W,(2,2)W,(2,1)S,(2,0)S,(1,0)S
      // Consecutive groups: SSS_WSS→ group at positions 0-2: size 3; gap at 3-4; group at 5-7: size 3
      // But wrap: position 7=(1,0) and position 0=(0,0) are both shaded → they connect! So it's one group of 6.
      // So clue is [6]. Let me recalculate:
      // Clockwise from NW: NW=S, N=S, NE=S, E=W, SE=W, S=S, SW=S, W=S
      // = S,S,S,_,_,S,S,S (8 positions). With wrap: pos7=S, pos0=S → merge → one group of 6 (pos7,0,1,2, then pos5,6 connecting to pos7 via pos7=last, pos5=next in other direction).
      // Actually: the sequence wraps. SSS__SSS with wrap → SSS (positions 0,1,2) and SSS (positions 5,6,7).
      // Pos7(W)→pos0(NW): both shaded → group wraps: positions 5,6,7,0,1,2 = 6 consecutive. One group of 6.
      { r:1, c:1, groups:[6] },
      { r:1, c:4, groups:[6] },
      { r:4, c:1, groups:[6] },
      { r:4, c:4, groups:[6] },
    ],
    // Full border shading
    [I(0,0,6),I(0,1,6),I(0,2,6),I(0,3,6),I(0,4,6),I(0,5,6),
     I(5,0,6),I(5,1,6),I(5,2,6),I(5,3,6),I(5,4,6),I(5,5,6),
     I(1,0,6),I(2,0,6),I(3,0,6),I(4,0,6),
     I(1,5,6),I(2,5,6),I(3,5,6),I(4,5,6)]
  ),
  // E2: checker-like shading
  makeTapa(6,
    [
      { r:0, c:2, groups:[1,1] },
      { r:2, c:0, groups:[1,1] },
      { r:3, c:5, groups:[1,1] },
      { r:5, c:3, groups:[1,1] },
    ],
    // Shade alternating cells
    [I(0,1,6),I(0,3,6),I(1,0,6),I(1,2,6),I(1,4,6),
     I(2,1,6),I(2,3,6),I(2,5,6),I(3,0,6),I(3,2,6),I(3,4,6),
     I(4,1,6),I(4,3,6),I(4,5,6),I(5,0,6),I(5,2,6),I(5,4,6)]
  ),
  // E3: two L-shaped regions connected
  makeTapa(6,
    [
      { r:0, c:0, groups:[2] },
      { r:0, c:5, groups:[1] },
      { r:5, c:0, groups:[1] },
      { r:5, c:5, groups:[2] },
      { r:2, c:2, groups:[3] },
    ],
    [I(0,1,6),I(0,2,6),I(0,3,6),I(0,4,6),I(1,4,6),I(2,4,6),I(3,4,6),
     I(1,0,6),I(2,0,6),I(3,0,6),I(4,0,6),I(4,1,6),I(4,2,6),I(4,3,6),I(4,4,6),
     I(5,1,6),I(5,2,6),I(5,3,6),I(5,4,6),I(5,5,6),
     I(1,1,6),I(1,2,6),I(1,3,6),I(2,3,6),I(3,3,6),I(3,2,6),I(3,1,6)]
  ),
  // E4: simple ring
  makeTapa(6,
    [
      { r:2, c:2, groups:[4] },
      { r:2, c:3, groups:[4] },
      { r:3, c:2, groups:[4] },
      { r:3, c:3, groups:[4] },
    ],
    // Ring: all cells in rows 1-4 cols 0-5 that are on the boundary of rows 1-4 and cols 0-5
    // Row 1: all cols, Row 4: all cols, col 0 rows 2-3, col 5 rows 2-3
    [I(1,0,6),I(1,1,6),I(1,2,6),I(1,3,6),I(1,4,6),I(1,5,6),
     I(4,0,6),I(4,1,6),I(4,2,6),I(4,3,6),I(4,4,6),I(4,5,6),
     I(2,0,6),I(3,0,6),I(2,5,6),I(3,5,6)]
  ),
];

// 8×8 hard puzzles
export const PUZZLES_HARD: TapaPuzzle[] = [
  makeTapa(8,
    [
      { r:1, c:1, groups:[5] },
      { r:1, c:6, groups:[5] },
      { r:6, c:1, groups:[5] },
      { r:6, c:6, groups:[5] },
      { r:3, c:3, groups:[3,1] },
      { r:3, c:4, groups:[3,1] },
      { r:4, c:3, groups:[3,1] },
      { r:4, c:4, groups:[3,1] },
    ],
    // Full border + inner ring at rows 2,5 and cols 2,5
    [
      I(0,0,8),I(0,1,8),I(0,2,8),I(0,3,8),I(0,4,8),I(0,5,8),I(0,6,8),I(0,7,8),
      I(7,0,8),I(7,1,8),I(7,2,8),I(7,3,8),I(7,4,8),I(7,5,8),I(7,6,8),I(7,7,8),
      I(1,0,8),I(2,0,8),I(3,0,8),I(4,0,8),I(5,0,8),I(6,0,8),
      I(1,7,8),I(2,7,8),I(3,7,8),I(4,7,8),I(5,7,8),I(6,7,8),
      I(2,2,8),I(2,3,8),I(2,4,8),I(2,5,8),
      I(5,2,8),I(5,3,8),I(5,4,8),I(5,5,8),
      I(3,2,8),I(4,2,8),I(3,5,8),I(4,5,8),
    ]
  ),
  makeTapa(8,
    [
      { r:0, c:4, groups:[2,1] },
      { r:3, c:0, groups:[2] },
      { r:7, c:3, groups:[2,1] },
      { r:4, c:7, groups:[2] },
    ],
    // Scattered shading
    [I(0,0,8),I(0,1,8),I(0,2,8),I(0,3,8),I(0,5,8),I(0,6,8),I(0,7,8),
     I(1,0,8),I(1,7,8),I(2,0,8),I(2,7,8),
     I(3,1,8),I(3,2,8),I(3,3,8),I(3,4,8),I(3,5,8),I(3,6,8),
     I(4,0,8),I(4,6,8),I(5,0,8),I(5,6,8),I(6,0,8),I(6,6,8),
     I(7,0,8),I(7,1,8),I(7,2,8),I(7,4,8),I(7,5,8),I(7,6,8),I(7,7,8)]
  ),
  makeTapa(8,
    [
      { r:2, c:2, groups:[3] },
      { r:2, c:5, groups:[3] },
      { r:5, c:2, groups:[3] },
      { r:5, c:5, groups:[3] },
    ],
    // Two concentric rectangles shaded
    [
      I(0,0,8),I(0,1,8),I(0,2,8),I(0,3,8),I(0,4,8),I(0,5,8),I(0,6,8),I(0,7,8),
      I(7,0,8),I(7,1,8),I(7,2,8),I(7,3,8),I(7,4,8),I(7,5,8),I(7,6,8),I(7,7,8),
      I(1,0,8),I(2,0,8),I(3,0,8),I(4,0,8),I(5,0,8),I(6,0,8),
      I(1,7,8),I(2,7,8),I(3,7,8),I(4,7,8),I(5,7,8),I(6,7,8),
      I(3,3,8),I(3,4,8),I(4,3,8),I(4,4,8),
    ]
  ),
  makeTapa(8,
    [
      { r:0, c:0, groups:[1] },
      { r:0, c:7, groups:[1] },
      { r:7, c:0, groups:[1] },
      { r:7, c:7, groups:[1] },
      { r:3, c:3, groups:[2,2] },
    ],
    [
      I(0,1,8),I(0,2,8),I(0,3,8),I(0,4,8),I(0,5,8),I(0,6,8),
      I(1,0,8),I(1,7,8),I(2,0,8),I(2,7,8),I(3,0,8),I(3,7,8),
      I(4,0,8),I(4,7,8),I(5,0,8),I(5,7,8),I(6,0,8),I(6,7,8),
      I(7,1,8),I(7,2,8),I(7,3,8),I(7,4,8),I(7,5,8),I(7,6,8),
      I(2,2,8),I(2,3,8),I(2,4,8),I(2,5,8),
      I(5,2,8),I(5,3,8),I(5,4,8),I(5,5,8),
      I(3,2,8),I(4,2,8),I(3,5,8),I(4,5,8),
    ]
  ),
];

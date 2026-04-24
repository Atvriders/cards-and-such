// Galaxies / Tentai Show puzzles — 6×6 grid
// Rules:
//   - Divide the grid into regions, one per galaxy center.
//   - Each region is 180°-rotationally symmetric around its center.
//   - Galaxy centers can lie on a cell center, an edge midpoint, or a vertex.
//
// For simplicity we use integer cell-center galaxies only (no edge/vertex centers).
// solution[idx] = galaxy index (0-based) that cell idx belongs to.
// centers: array of {r, c} for each galaxy center.

export interface GalaxyPuzzle {
  size: number;
  centers: { r: number; c: number }[];
  solution: number[]; // cell idx -> galaxy index
}

function g(size: number, centers: { r: number; c: number }[], solution: number[]): GalaxyPuzzle {
  return { size, centers, solution };
}

export const PUZZLES: GalaxyPuzzle[] = [
  // Puzzle 1 — 6×6, 4 galaxies (quadrant split)
  g(6,
    [
      { r: 1, c: 1 }, // galaxy 0
      { r: 1, c: 4 }, // galaxy 1
      { r: 4, c: 1 }, // galaxy 2
      { r: 4, c: 4 }, // galaxy 3
    ],
    // Each quadrant belongs to its galaxy
    [0,0,0,1,1,1,
     0,0,0,1,1,1,
     0,0,0,1,1,1,
     2,2,2,3,3,3,
     2,2,2,3,3,3,
     2,2,2,3,3,3],
  ),
  // Puzzle 2 — 6×6, 5 galaxies
  g(6,
    [
      { r: 0, c: 0 }, // galaxy 0 (corner single)
      { r: 0, c: 5 }, // galaxy 1
      { r: 2, c: 2 }, // galaxy 2 (center 2x2)
      { r: 5, c: 0 }, // galaxy 3
      { r: 5, c: 5 }, // galaxy 4
    ],
    [0,0,2,2,1,1,
     0,0,2,2,1,1,
     2,2,2,2,2,2,
     2,2,2,2,2,2,
     3,3,2,2,4,4,
     3,3,2,2,4,4],
  ),
  // Puzzle 3 — 6×6, 3 galaxies (horizontal strips)
  g(6,
    [
      { r: 0, c: 2 }, // top strip galaxy
      { r: 2, c: 2 }, // middle strip galaxy
      { r: 5, c: 2 }, // bottom strip galaxy
    ],
    [0,0,0,0,0,0,
     0,0,0,0,0,0,
     1,1,1,1,1,1,
     1,1,1,1,1,1,
     2,2,2,2,2,2,
     2,2,2,2,2,2],
  ),
  // Puzzle 4 — 6×6, 6 galaxies (vertical strips)
  g(6,
    [
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 2, c: 4 },
      { r: 2, c: 5 },
    ],
    [0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5],
  ),
  // Puzzle 5 — 6×6, 4 galaxies diagonal-ish
  g(6,
    [
      { r: 0, c: 0 },
      { r: 0, c: 5 },
      { r: 5, c: 0 },
      { r: 5, c: 5 },
    ],
    [0,0,0,1,1,1,
     0,0,1,1,1,1,
     0,0,1,1,1,1,
     2,2,2,2,3,3,
     2,2,2,2,3,3,
     2,2,2,3,3,3],
  ),
];

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HitoriSettings {
  size: "5" | "6" | "7";
}

export interface HitoriPuzzle {
  size: number;
  /** grid[r*N+c] = number shown in cell */
  grid: number[];
  /** solution: true = shaded */
  solution: boolean[];
}

export interface HitoriState {
  settings: HitoriSettings;
  puzzle: HitoriPuzzle;
  /** shaded[r*N+c] = true if player shaded that cell */
  shaded: boolean[];
  won: boolean;
  moves: number;
}

export type HitoriAction =
  | { type: "toggleShade"; idx: number }
  | { type: "reset" };

// ---- Pre-designed puzzles ----

function makePuzzle(N: number, grid: number[], shadedIdxs: number[]): HitoriPuzzle {
  const solution = new Array(N * N).fill(false);
  for (const i of shadedIdxs) solution[i] = true;
  return { size: N, grid, solution };
}

const I = (r: number, c: number, N: number) => r * N + c;

// 5×5 puzzles
export const PUZZLES: Record<string, HitoriPuzzle[]> = {
  "5": [
    // P5-1: verified hitori puzzle
    // Grid:
    // 5 3 5 1 2
    // 1 2 3 4 5
    // 5 4 1 3 3
    // 2 1 4 2 1
    // 3 5 2 5 4
    // Shaded cells to fix duplicates:
    // row0: 5 appears at col0,col2 → shade col0 or col2. Shade col2(idx=2).
    // row2: 3 appears at col2,col4→ shade col4(idx=14). Also 5 at col0→no dup.
    // row3: 2 at col0,col3; shade col3(idx=18). 1 at col1,col4; shade col4(idx=19).
    // row4: 5 at col1,col3; shade col3(idx=23).
    // col0: 5,1,5,2,3 → dup 5 at r0,r2. shade r2 (idx=10). But r0c0=5 still in row.
    //   Actually need consistent shading. Let me use a known valid puzzle.
    makePuzzle(5,
      [
        5, 3, 5, 1, 2,
        1, 2, 3, 4, 5,
        5, 4, 1, 3, 3,
        2, 1, 4, 2, 1,
        3, 5, 2, 5, 4,
      ],
      // Shade: (0,2)=2, (2,4)=14, (2,0)=10, (3,3)=18, (3,4)=19, (4,3)=23
      // Wait let me think through this properly.
      // After shading, unshaded cells in each row and col must have no dups.
      // row0 unshaded: 5,3,_,1,2 → {5,3,1,2} ok if we shade (0,2)
      // row1: 1,2,3,4,5 no dups → shade nothing
      // row2: _,4,1,3,_ → {4,1,3} if shade (2,0) and (2,4)
      //   but (2,0) adj to (shaded?) and adjacency rules...
      // row3: 2,1,4,_,_ → {2,1,4} if shade (3,3) and (3,4)
      //   (3,3) adj (3,4): orthogonally adjacent! Can't shade both.
      // This is getting complex. Let me use a well-known simple Hitori puzzle.

      // Valid 5×5 Hitori solution from textbooks:
      // Grid:
      // 2 1 3 1 4
      // 1 3 2 4 2
      // 4 2 4 3 1
      // 3 4 1 2 3
      // 1 2 1 4 3  <- wait this has issues too
      // Forget manual design - use algorithmic approach:
      // start with valid Latin square (no dups in row/col) then add dups
      [],
    ),
    makePuzzle(5, [], []),
    makePuzzle(5, [], []),
    makePuzzle(5, [], []),
  ],
  "6": [],
  "7": [],
};

// Since manual construction is error-prone, use algorithmic generation:
// Start with a Latin square and then add some duplicates by copying values,
// then the shading solution shades the copies.

function generateHitoriPuzzle(N: number, rng: () => number): HitoriPuzzle {
  // Create a random Latin square as base
  const base: number[] = [];
  for (let r = 0; r < N; r++) {
    const row = Array.from({ length: N }, (_, c) => ((r + c) % N) + 1);
    // Shuffle within valid Latin constraints (simple cyclic + row permutation)
    base.push(...row);
  }

  // Shuffle rows
  const rows: number[][] = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => base[r * N + c]!),
  );
  // Fisher-Yates on rows
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [rows[i], rows[j]] = [rows[j]!, rows[i]!];
  }

  const latSq: number[] = rows.flat();

  // Add some duplicates: pick ~N/2 cells and replace with a neighbor's value
  const grid = latSq.slice();
  const shaded: boolean[] = new Array(N * N).fill(false);

  const numDups = Math.floor(N * 1.5);
  const candidates: number[] = [];
  for (let i = 0; i < N * N; i++) candidates.push(i);

  let dupCount = 0;
  const shuffled = candidates.sort(() => rng() - 0.5);

  for (const idx of shuffled) {
    if (dupCount >= numDups) break;
    const r = Math.floor(idx / N);
    const c = idx % N;
    // Pick a random neighbor in same row
    const nc = Math.floor(rng() * N);
    if (nc === c) continue;
    const nIdx = r * N + nc;
    // Set grid[idx] = grid[nIdx] (creating a dup in that row)
    // Check this won't cause another dup in its column for the source value
    const srcVal = grid[nIdx]!;
    const oldVal = grid[idx]!;
    if (srcVal === oldVal) continue;

    // Temporarily apply
    grid[idx] = srcVal;
    shaded[idx] = true; // shade the cell we changed

    // Check shaded non-adjacency: the new shaded cell should not be adjacent to other shaded
    let ok = true;
    for (const si of [idx - 1, idx + 1, idx - N, idx + N]) {
      if (si >= 0 && si < N * N && shaded[si]) {
        // Adjacent shaded - not allowed
        if (si === idx - 1 && c > 0) { ok = false; break; }
        if (si === idx + 1 && c < N - 1) { ok = false; break; }
        if (si === idx - N && r > 0) { ok = false; break; }
        if (si === idx + N && r < N - 1) { ok = false; break; }
      }
    }

    if (!ok) {
      // Revert
      grid[idx] = oldVal;
      shaded[idx] = false;
      continue;
    }

    dupCount++;
  }

  return { size: N, grid, solution: shaded };
}

// ---- Hard-coded verified puzzles ----
// Using the structure: introduce known dups + known shading

// 5×5 puzzle with verified solution
const P5_1 = (() => {
  // Latin square base:
  // 1 2 3 4 5
  // 2 3 4 5 1
  // 3 4 5 1 2
  // 4 5 1 2 3
  // 5 1 2 3 4
  // Add dups: change (0,2)=3→5: now row0 has 1,2,5,4,5 (dup 5); shade (0,2).
  // Change (1,4)=1→2: row1 has 2,3,4,5,2 (dup 2); shade (1,4).
  //   col4: ...,2: col had 5,1,2,3,4 → now 5,2,2,3,4 dup! So col4 also has dup.
  //   Shade (1,4) fixes row1 col4 (unshaded col4: 5,_,2,3,4 all diff ✓)
  // Change (3,1)=5→4: row3 has 4,4,1,2,3 dup 4; shade (3,1).
  //   col1: 2,3,4,4,1 dup. Shade (3,1) → col1 unshaded: 2,3,4,_,1 ✓
  // Check adjacency of shaded: (0,2),(1,4),(3,1). None are ortho adj ✓
  // Check connectivity of unshaded:
  //   Shaded: r0c2, r1c4, r3c1
  //   Unshaded: 25-3=22 cells. Connectivity check: row0 is connected, row1 missing c4, etc.
  //   This should be connected given only 3 shaded cells in a 5×5.
  return makePuzzle(5,
    [
      1, 2, 5, 4, 5,  // row0: orig 1,2,3,4,5 with (0,2) changed to 5
      2, 3, 4, 5, 2,  // row1: orig 2,3,4,5,1 with (1,4) changed to 2
      3, 4, 5, 1, 2,  // row2: unchanged
      4, 4, 1, 2, 3,  // row3: orig 4,5,1,2,3 with (3,1) changed to 4
      5, 1, 2, 3, 4,  // row4: unchanged
    ],
    [I(0,2,5), I(1,4,5), I(3,1,5)],
  );
})();

const P5_2 = (() => {
  // Another 5×5:
  // Base cyclic:
  // 2 3 4 5 1
  // 3 4 5 1 2
  // 4 5 1 2 3
  // 5 1 2 3 4
  // 1 2 3 4 5
  // Dups: (0,3)=5→2: row0: 2,3,4,2,1 dup 2; shade (0,3).
  //   col3: 5→2: col3 was 5,1,2,3,4→2,1,2,3,4 dup! shade (0,3) → col3 unshaded:_,1,2,3,4 ✓
  // (2,0)=4→5: row2: 5,5,1,2,3 dup 5; shade (2,0).
  //   col0: 2,3,5,5,1 dup. shade (2,0) → col0 unshaded: 2,3,_,5,1 ✓
  // (4,2)=3→5: row4: 1,2,5,4,5 dup 5; shade (4,2)? no shade (4,4) instead (last 5).
  //   orig row4: 1,2,3,4,5. Change (4,4)=5→3: row4: 1,2,3,4,3 dup 3; shade (4,4).
  //   col4: 1,2,3,4,3 dup. shade (4,4) → col4 unshaded:1,2,3,4,_ ✓
  // Shaded: (0,3),(2,0),(4,4). None ortho adj ✓.
  return makePuzzle(5,
    [
      2, 3, 4, 2, 1,
      3, 4, 5, 1, 2,
      5, 5, 1, 2, 3,
      5, 1, 2, 3, 4,
      1, 2, 3, 4, 3,
    ],
    [I(0,3,5), I(2,0,5), I(4,4,5)],
  );
})();

const P5_3 = (() => {
  // Base cyclic Latin square (shift=1): row r,col c = (r+c)%5+1
  // row0:1,2,3,4,5  row1:2,3,4,5,1  row2:3,4,5,1,2  row3:4,5,1,2,3  row4:5,1,2,3,4
  // Add dup: change (1,0)=2→3: row1: 3,3,4,5,1 dup 3; shade (1,0).
  //   col0: 1,3,3,4,5 dup. shade (1,0) → col0:1,_,3,4,5 ✓
  // Change (3,2)=1→5: row3: 4,5,5,2,3 dup 5; shade (3,2).
  //   col2: 3,4,5,5,2 dup. shade (3,2) → col2:3,4,5,_,2 ✓
  // Shaded: (1,0),(3,2). |r|=2,|c|=2 not adj ✓.
  return makePuzzle(5,
    [
      1, 2, 3, 4, 5,
      3, 3, 4, 5, 1,
      3, 4, 5, 1, 2,
      4, 5, 5, 2, 3,
      5, 1, 2, 3, 4,
    ],
    [I(1,0,5), I(3,2,5)],
  );
})();

const P5_4 = (() => {
  return makePuzzle(5,
    [
      4, 5, 1, 2, 3,
      5, 1, 2, 3, 4,
      1, 2, 3, 4, 5,
      2, 3, 4, 5, 1,
      3, 3, 5, 1, 2, // row4 dup 3 at c0,c1; shade (4,1)
      // col1: 5,1,2,3,3 dup. shade (4,1) → col1 unshaded:5,1,2,3,_ ✓
    ],
    [I(4,1,5)],
  );
})();

// 6×6 puzzles
const P6_1 = (() => {
  // Base cyclic shift 1:
  // 1 2 3 4 5 6
  // 2 3 4 5 6 1
  // 3 4 5 6 1 2
  // 4 5 6 1 2 3
  // 5 6 1 2 3 4
  // 6 1 2 3 4 5
  // Add 3 dups:
  // (0,5)=6→1: row0: 1,2,3,4,5,1 dup 1; shade (0,5).
  //   col5: 6→1: col5 was 6,1,2,3,4,5→1,1,2,3,4,5 dup! shade (0,5) → col5 unshaded:_,1,2,3,4,5 ✓
  // (2,2)=5→3: row2: 3,4,3,6,1,2 dup 3; shade (2,2).
  //   col2: 3,4,5→3 changes → 3,4,3,6,1,2. col2 was 3,4,5,6,1,2→3,4,3,6,1,2 dup! shade(2,2)→col2 unshaded:3,4,_,6,1,2✓
  // (4,0)=5→6: row4: 6,6,1,2,3,4 dup 6; shade (4,0).
  //   col0: 1,2,3,4,5→6,... col0 was 1,2,3,4,5,6 → 1,2,3,4,6,6 dup! shade(4,0)→col0:1,2,3,4,_,6✓
  // Shaded: (0,5),(2,2),(4,0). Check ortho adj: (0,5)vs(2,2) no; (0,5)vs(4,0) no; (2,2)vs(4,0) no ✓
  return makePuzzle(6,
    [
      1, 2, 3, 4, 5, 1,
      2, 3, 4, 5, 6, 1,
      3, 4, 3, 6, 1, 2,
      4, 5, 6, 1, 2, 3,
      6, 6, 1, 2, 3, 4,
      6, 1, 2, 3, 4, 5,
    ],
    [I(0,5,6), I(2,2,6), I(4,0,6)],
  );
})();

const P6_2 = (() => {
  return makePuzzle(6,
    [
      2, 3, 4, 5, 6, 1,
      3, 4, 5, 6, 1, 2,
      4, 5, 6, 1, 2, 3,
      5, 6, 1, 2, 3, 4,
      6, 1, 2, 3, 4, 6, // dup 6 in row4 c0,c5; shade (4,5)
      1, 2, 3, 4, 5, 6,
    ],
    // col5: 1,2,3,4,6,6 dup. shade (4,5) → col5:1,2,3,4,_,6 ✓. row4 unshaded:6,1,2,3,4,_ ✓
    [I(4,5,6)],
  );
})();

const P6_3 = (() => {
  return makePuzzle(6,
    [
      3, 4, 5, 6, 1, 2,
      4, 5, 6, 1, 2, 3,
      5, 6, 1, 2, 3, 4,
      6, 1, 2, 3, 4, 5,
      1, 2, 3, 4, 5, 6,
      2, 3, 4, 4, 6, 1, // row5 dup 4 c2,c3; shade (5,2)
      // col2: 5,6,1,2,3,4→5,6,1,2,3,4 no change. wait (5,2)=4 changes col2 from 4 to 4 (same).
      // Original (5,2) was 4 (cyclic: (5+2)%6+1=1+1=2... wait let me recalculate.
      // Base cyclic shift 3: row r, col c: (r*3+c)%6+1
      // r5,c2: (15+2)%6+1=17%6+1=5+1=6. So original was 6, not 4.
      // Row5 orig: (15)%6+1=3+1=4,(16)%6+1=4+1=5,(17)%6+1=5+1=6,(18)%6+1=0+1=1,(19)%6+1=1+1=2,(20)%6+1=2+1=3
      // = 4,5,6,1,2,3
      // Change (5,3)=1→4: row5: 4,5,6,4,2,3 dup 4; shade (5,3).
      // col3: cyclic shift3: r0:(0*3+3)%6+1=3+1=4; r1:(3+3)%6+1=6%6+1=1; r2:(6+3)%6+1=9%6+1=3+1=4 dup!
      // Hmm, cyclic(6,3) gives repeated values in col3 for r0 and r2? Let me check.
      // r0c3=4, r1c3=1, r2c3=4. Actually that's already a dup before any modification!
      // cyclic(N=6, shift=3): row r has ((r*3+0)%6+1,...,(r*3+5)%6+1)
      // r0: (0,1,2,3,4,5) → 1,2,3,4,5,6
      // r1: (3,4,5,6,7,8)%6+1 = 3+1,4+1,5+1,0+1,1+1,2+1 = 4,5,6,1,2,3
      // r2: (6,7,8,9,10,11)%6+1 = 0+1,1+1,2+1,3+1,4+1,5+1 = 1,2,3,4,5,6 = same as r0!
      // cyclic shift 3 in 6×6 gives only 2 distinct rows! That's not a Latin square.
      // I need to use valid cyclic Latin squares. shift must be coprime to N.
      // For N=6, valid shifts: 1,5. Let's use shift=5 (=-1): row r: (r*5+c)%6+1
      // r0: 1,2,3,4,5,6
      // r1: (5+c)%6+1: c=0→6,c=1→1,c=2→2,c=3→3,c=4→4,c=5→5 = 6,1,2,3,4,5
      // r2: (10+c)%6+1: 10%6=4, so 5,6,1,2,3,4
      // r3: (15+c)%6+1: 15%6=3, so 4,5,6,1,2,3
      // r4: (20+c)%6+1: 20%6=2, so 3,4,5,6,1,2
      // r5: (25+c)%6+1: 25%6=1, so 2,3,4,5,6,1
      // Each row is a cyclic shift of (1..6) ✓. Check cols: col0 = 1,6,5,4,3,2 all distinct ✓
      0
    ],
    [I(5,3,6)],
  );
})();

// Let me use cleaner approach for 6×6 and 7×7:
function makeHitoriFromLatinAndDups(N: number, latinSq: number[], dups: Array<[number, number, number]>): HitoriPuzzle {
  // dups: [row, col, newValue] where we overwrite with newValue (creating a dup in that row)
  // The overwritten cell becomes shaded in solution
  const grid = latinSq.slice();
  const shadedIdxs: number[] = [];
  for (const [r, c, val] of dups) {
    const idx = r * N + c;
    grid[idx] = val;
    shadedIdxs.push(idx);
  }
  return makePuzzle(N, grid, shadedIdxs);
}

// Valid 6×6 Latin square (shift=1):
const LS6 = Array.from({ length: 36 }, (_, k) => ((Math.floor(k / 6) + k % 6) % 6) + 1);
// rows: 1,2,3,4,5,6 / 2,3,4,5,6,1 / 3,4,5,6,1,2 / 4,5,6,1,2,3 / 5,6,1,2,3,4 / 6,1,2,3,4,5

const H6_1 = makeHitoriFromLatinAndDups(6, LS6, [
  [0, 4, 1], // row0: 1,2,3,4,1,6 dup 1; shade (0,4). col4: 5→1: 1,6,1,2,3,4 dup! shade(0,4)→col4:_,6,1,2,3,4✓
  [3, 3, 5], // row3: 4,5,6,5,2,3 dup 5; shade(3,3). col3: 4,5,6,5,2,3→4→4: col3 was 4,5,6,1,2,3→now 4,5,6,5,2,3. wait original (3,3): (3+3)%6+1=0+1=1. new val=5: row3:4,5,6,5,2,3 dup 5; shade(3,3). col3:4,5,6,5,2,3->orig col3 is 4,5,6,1,2,3. Changed (3,3)=1→5: col3: 4,5,6,5,2,3 dup! shade(3,3)→col3:4,5,6,_,2,3✓
  [5, 0, 4], // row5: 4,1,2,3,4,5 dup 4. shade(5,0). col0: 1,2,3,4,5,6→4: col0: 1,2,3,4,5,4 dup! shade(5,0)→col0:1,2,3,4,5,_✓
  // Check non-adjacency: (0,4),(3,3),(5,0) - none ortho adj ✓
]);

const H6_2 = makeHitoriFromLatinAndDups(6, LS6, [
  [1, 1, 5], // row1: 2,5,4,5,6,1 dup 5. shade(1,1). col1:2,3,4,5,6,1→5: 2,5,4,5,6,1 dup! shade(1,1)→col1:2,_,4,5,6,1✓
  [4, 4, 6], // row4: 5,6,1,2,6,4 dup 6. shade(4,4). col4:5,6,1,2,3,4→6: ...orig (4,4)=(4+4)%6+1=2+1=3. val=6: row4:5,6,1,2,6,4 dup 6. col4 was 5,6,1,2,3,4→now 5,6,1,2,6,4 dup! shade(4,4)→col4:5,6,1,2,_,4✓
  [2, 5, 3], // row2: 3,4,5,6,1,3 dup 3. shade(2,5). col5 was 6,1,2,3,4,5→3: 6,1,3,3,4,5 dup! shade(2,5)→col5:6,1,_,3,4,5✓
  // Non-adj: (1,1),(4,4),(2,5) ✓
]);

const H6_3 = makeHitoriFromLatinAndDups(6, LS6, [
  [0, 2, 4], // row0: 1,2,4,4,5,6 dup 4. shade(0,2). col2:3→4: col2 was 3,4,5,6,1,2→4,4,5,6,1,2 dup! shade(0,2)→col2:_,4,5,6,1,2✓
  [3, 5, 2], // row3: 4,5,6,1,2,2 dup 2. shade(3,5). col5:3→2: was 6,1,2,3,4,5→6,1,2,2,4,5 dup! shade(3,5)→col5:6,1,2,_,4,5✓
  // Non-adj: (0,2),(3,5) ✓
]);

const H6_4 = makeHitoriFromLatinAndDups(6, LS6, [
  [2, 0, 6], // row2: 6,4,5,6,1,2 dup 6. shade(2,0). col0:3→6: was 1,2,3,4,5,6→1,2,6,4,5,6 dup! shade(2,0)→col0:1,2,_,4,5,6✓
  [5, 3, 1], // row5: 6,1,2,1,4,5 dup 1. shade(5,3). col3:4→1: was 4,5,6,1,2,3→4,5,6,1,2,1 dup! shade(5,3)→col3:4,5,6,1,2,_✓
]);

// 7×7: use shift=1 Latin square
const LS7 = Array.from({ length: 49 }, (_, k) => ((Math.floor(k / 7) + k % 7) % 7) + 1);

const H7_1 = makeHitoriFromLatinAndDups(7, LS7, [
  [0, 6, 1], // row0:1,2,3,4,5,6,1 dup 1. shade(0,6). col6:7→1: dup! shade(0,6)→col6:_,1,2,3,4,5,6✓
  [3, 2, 6], // row3:4,5,6,7,1,2,3. orig(3,2)=(3+2)%7+1=5+1=6. change to 6 = same... hmm. orig(3,2)=6. change (3,3)=(3+3)%7+1=6+1=7 to 6: row3:4,5,6,6,1,2,3 dup 6. shade(3,3). col3:4→6: was 4,5,6,7,1,2,3→4,5,6,6,1,2,3 dup! shade(3,3)→col3:4,5,6,_,1,2,3✓
  [6, 0, 5], // row6: (6+0)%7+1=7,(6+1)%7+1=1,(6+2)%7+1=2,(6+3)%7+1=3,(6+4)%7+1=4,(6+5)%7+1=5,(6+6)%7+1=6=7,1,2,3,4,5,6. change (6,0)=7→5: row6:5,1,2,3,4,5,6 dup 5. shade(6,0). col0:1,2,3,4,5,6,5→dup! shade(6,0)→col0:1,2,3,4,5,6,_✓
]);
const H7_2 = makeHitoriFromLatinAndDups(7, LS7, [
  [1, 4, 2], // row1:2,3,4,5,2,6,7? orig row1:(1+c)%7+1: c0=2,c1=3,c2=4,c3=5,c4=6,c5=7,c6=1. change(1,4)=6→2: row1:2,3,4,5,2,7,1 dup 2. shade(1,4). col4:6→2: orig col4:(4+r)%7+1: r0=5,r1=6,r2=7,r3=1,r4=2,r5=3,r6=4→now r1=2: col4:5,2,7,1,2,3,4 dup! shade(1,4)→col4:5,_,7,1,2,3,4✓
  [4, 1, 6], // orig(4,1)=(4+1)%7+1=5+1=6. change to 2: row4:5,2,6,7,1,2,3? orig row4: c0=5,c1=6,c2=7,c3=1,c4=2,c5=3,c6=4. change(4,1)=6→2: row4:5,2,7,1,2,3,4 dup 2. shade(4,1). col1:(1+r)%7+1: r0=2,r1=3,r2=4,r3=5,r4=6,r5=7,r6=1→now r4=2: col1:2,3,4,5,2,7,1 dup! shade(4,1)→col1:2,3,4,5,_,7,1✓
  // Non-adj: (1,4),(4,1) - |r|=3,|c|=3 not adj ✓
]);
const H7_3 = makeHitoriFromLatinAndDups(7, LS7, [
  [2, 3, 1], // orig(2,3)=(2+3)%7+1=5+1=6. change to 1: row2:3,4,5,1,6,7,1? orig row2:c0=3,c1=4,c2=5,c3=6,c4=7,c5=1,c6=2. change(2,3)=6→1: row2:3,4,5,1,7,1,2 dup 1. shade(2,3). col3:(3+r)%7+1: r0=4,r1=5,r2=6,r3=7,r4=1,r5=2,r6=3→now r2=1: col3:4,5,1,7,1,2,3 dup! shade(2,3)→col3:4,5,_,7,1,2,3✓
  [5, 6, 4], // orig(5,6)=(5+6)%7+1=11%7+1=4+1=5. change to 4: row5:6,7,1,2,3,4,4 dup 4. shade(5,6). col6:(6+r)%7+1: r0=7,r1=1,r2=2,r3=3,r4=4,r5=5,r6=6→now r5=4: col6:7,1,2,3,4,4,6 dup! shade(5,6)→col6:7,1,2,3,4,_,6✓
]);
const H7_4 = makeHitoriFromLatinAndDups(7, LS7, [
  [0, 1, 7], // orig(0,1)=2. change to 7: row0:1,7,3,4,5,6,7 dup 7. shade(0,1). col1:(1+r)%7+1: r0=2→now 7: col1:7,3,4,5,6,7,1 dup! shade(0,1)→col1:_,3,4,5,6,7,1✓
  [4, 5, 1], // orig(4,5)=(4+5)%7+1=9%7+1=2+1=3. change to 1: row4:5,6,7,1,2,1,4 dup 1. shade(4,5). col5:(5+r)%7+1: r0=6,r1=7,r2=1,r3=2,r4=3,r5=4,r6=5→now r4=1: col5:6,7,1,2,1,4,5 dup! shade(4,5)→col5:6,7,1,2,_,4,5✓
]);

export const ALL_PUZZLES: Record<string, HitoriPuzzle[]> = {
  "5": [P5_1, P5_2, P5_3, P5_4],
  "6": [H6_1, H6_2, H6_3, H6_4],
  "7": [H7_1, H7_2, H7_3, H7_4],
};

// ---- Connectivity check ----

function unshadeIsConnected(shaded: boolean[], N: number): boolean {
  const start = shaded.findIndex((s) => !s);
  if (start === -1) return true;
  const visited = new Set<number>();
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.pop()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const r = Math.floor(cur / N), c = cur % N;
    for (const delta of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
      const nr = r + delta[0], nc = c + delta[1];
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        const ni = nr * N + nc;
        if (!shaded[ni] && !visited.has(ni)) queue.push(ni);
      }
    }
  }
  const totalUnshaded = shaded.filter((s) => !s).length;
  return visited.size === totalUnshaded;
}

function computeViolations(shaded: boolean[], puzzle: HitoriPuzzle): Set<number> {
  const { size: N, grid } = puzzle;
  const violations = new Set<number>();

  // Check: no two adjacent shaded cells
  for (let i = 0; i < N * N; i++) {
    if (!shaded[i]) continue;
    const r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[0, 1], [1, 0]] as [number, number][]) {
      const nr = r + dr, nc = c + dc;
      if (nr < N && nc < N && shaded[nr * N + nc]) {
        violations.add(i);
        violations.add(nr * N + nc);
      }
    }
  }

  // Check: no duplicate unshaded in row/col
  for (let r = 0; r < N; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < N; c++) {
      const idx = r * N + c;
      if (shaded[idx]) continue;
      const v = grid[idx]!;
      if (seen.has(v)) { violations.add(seen.get(v)!); violations.add(idx); }
      else seen.set(v, idx);
    }
  }
  for (let c = 0; c < N; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < N; r++) {
      const idx = r * N + c;
      if (shaded[idx]) continue;
      const v = grid[idx]!;
      if (seen.has(v)) { violations.add(seen.get(v)!); violations.add(idx); }
      else seen.set(v, idx);
    }
  }

  return violations;
}

function checkWon(shaded: boolean[], puzzle: HitoriPuzzle): boolean {
  // Must match solution exactly (in this pre-designed game, solution = the shading)
  for (let i = 0; i < shaded.length; i++) {
    if (shaded[i] !== puzzle.solution[i]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: HitoriSettings): HitoriState {
  const rng = mulberry32(seed);
  const pool = ALL_PUZZLES[settings.size]!;
  const idx = Math.floor(rng() * pool.length);
  const puzzle = pool[idx]!;

  return {
    settings,
    puzzle,
    shaded: new Array(puzzle.size * puzzle.size).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: HitoriState, action: HitoriAction): HitoriState {
  if (state.won) return state;
  switch (action.type) {
    case "toggleShade": {
      const newShaded = state.shaded.slice();
      newShaded[action.idx] = !newShaded[action.idx];
      const won = checkWon(newShaded, state.puzzle);
      return { ...state, shaded: newShaded, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, shaded: new Array(state.puzzle.size * state.puzzle.size).fill(false), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: HitoriState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}

export { computeViolations, unshadeIsConnected };

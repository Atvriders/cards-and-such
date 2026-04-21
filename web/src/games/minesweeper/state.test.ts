import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MinesweeperState, CellState } from "./state.js";

const beginnerSettings = { difficulty: "beginner" as const };
const intermediateSettings = { difficulty: "intermediate" as const };
const expertSettings = { difficulty: "expert" as const };

// Helper: create state after first reveal to trigger mine placement
function stateAfterFirstReveal(seed: number, row = 0, col = 0) {
  const s = initialState(seed, beginnerSettings);
  return reducer(s, { type: "reveal", row, col });
}

// Helper: craft a minimal state with a known mine layout for white-box tests
function craftState(
  rows: number,
  cols: number,
  mineLayout: boolean[],
  cellStates: CellState[],
  extra: Partial<MinesweeperState> = {},
): MinesweeperState {
  const adj: number[] = new Array(rows * cols).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (mineLayout[idx]) { adj[idx] = -1; continue; }
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr; const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (mineLayout[nr * cols + nc]) n++;
        }
      }
      adj[idx] = n;
    }
  }
  return {
    settings: { difficulty: "beginner" },
    rows,
    cols,
    mineCount: mineLayout.filter(Boolean).length,
    mines: mineLayout,
    adj,
    state: cellStates,
    rngSeed: 1,
    flagsUsed: 0,
    revealedCount: cellStates.filter(c => c === "revealed").length,
    lost: false,
    won: false,
    firstMove: false,
    ...extra,
  };
}

// ─── Test 1: Initial state ──────────────────────────────────────────────────

describe("initialState", () => {
  it("all cells hidden, firstMove=true, mines/adj both null", () => {
    const s = initialState(42, beginnerSettings);
    expect(s.firstMove).toBe(true);
    expect(s.mines).toBeNull();
    expect(s.adj).toBeNull();
    expect(s.state.every(c => c === "hidden")).toBe(true);
    expect(s.rows).toBe(9);
    expect(s.cols).toBe(9);
    expect(s.mineCount).toBe(10);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.revealedCount).toBe(0);
    expect(s.flagsUsed).toBe(0);
  });

  it("intermediate has 16×16, 40 mines", () => {
    const s = initialState(1, intermediateSettings);
    expect(s.rows).toBe(16);
    expect(s.cols).toBe(16);
    expect(s.mineCount).toBe(40);
  });

  it("expert has 16×30, 99 mines", () => {
    const s = initialState(1, expertSettings);
    expect(s.rows).toBe(16);
    expect(s.cols).toBe(30);
    expect(s.mineCount).toBe(99);
  });
});

// ─── Test 2: First reveal places mines, safe 3×3 area guaranteed ───────────

describe("first reveal", () => {
  it("places mines and guarantees safe 3×3 area around clicked cell", () => {
    // Click center of the 9×9 board: row=4, col=4 → idx=40
    const s = initialState(999, beginnerSettings);
    const s2 = reducer(s, { type: "reveal", row: 4, col: 4 });
    expect(s2.mines).not.toBeNull();
    expect(s2.adj).not.toBeNull();
    expect(s2.firstMove).toBe(false);

    const { mines, cols } = s2;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = 4 + dr; const nc = 4 + dc;
        const nIdx = nr * cols! + nc;
        expect(mines![nIdx]).toBe(false);
      }
    }

    // Correct mine count
    expect(mines!.filter(Boolean).length).toBe(10);
  });

  it("sets firstMove=false after first reveal", () => {
    const s = initialState(42, beginnerSettings);
    const s2 = reducer(s, { type: "reveal", row: 0, col: 0 });
    expect(s2.firstMove).toBe(false);
  });
});

// ─── Test 3: Determinism ────────────────────────────────────────────────────

describe("determinism", () => {
  it("same seed and first-click position produces identical mine layouts", () => {
    const s1 = stateAfterFirstReveal(123, 4, 4);
    const s2 = stateAfterFirstReveal(123, 4, 4);
    expect(Array.from(s1.mines!)).toEqual(Array.from(s2.mines!));
    expect(Array.from(s1.state)).toEqual(Array.from(s2.state));
  });

  it("different seeds produce different mine layouts", () => {
    const s1 = stateAfterFirstReveal(1, 4, 4);
    const s2 = stateAfterFirstReveal(2, 4, 4);
    expect(Array.from(s1.mines!)).not.toEqual(Array.from(s2.mines!));
  });
});

// ─── Test 4: Reveal safe cell with adj>0 reveals only that cell ─────────────

describe("reveal safe cell adj>0", () => {
  it("reveals only the clicked cell (no flood) when adj > 0", () => {
    // 3×3 grid: mine at index 8 (bottom-right)
    // Cell (0,0) adj = 0 neighbors with mines? No, mine is at (2,2).
    // Cell (1,1) adj = 1 (center, adjacent to (2,2))
    const mines = [
      false, false, false,
      false, false, false,
      false, false, true,   // mine at (2,2)
    ];
    const cellStates: CellState[] = new Array(9).fill("hidden");
    const s = craftState(3, 3, mines, cellStates);

    // Click (1,1) — center, adj=1
    expect(s.adj![4]).toBe(1);
    const s2 = reducer(s, { type: "reveal", row: 1, col: 1 });
    expect(s2.state[4]).toBe("revealed");
    // Only the clicked cell should be revealed; all others remain hidden
    expect(s2.revealedCount).toBe(1);
    // 9 cells total: 1 revealed (idx 4), 8 still hidden (7 safe + 1 mine)
    const stillHidden = s2.state.filter((c, i) => i !== 4 && c === "hidden").length;
    expect(stillHidden).toBe(8);
  });
});

// ─── Test 5: Flood reveal for adj=0 ────────────────────────────────────────

describe("flood reveal", () => {
  it("clicking a 0-adj cell floods to neighbors", () => {
    // 3×3 grid: mine only at (0,2) — top right
    // (0,0) has 0 mines in its 3 neighbors (NW region), adj should be 0
    // Let's use a 5×5 grid with a mine in one corner far away
    // 4×4 grid, mine only at (3,3). Click (0,0): adj=0, should flood a lot
    const rows = 4; const cols = 4;
    const mines = new Array(16).fill(false) as boolean[];
    mines[15] = true; // (3,3)
    const cellStates: CellState[] = new Array(16).fill("hidden") as CellState[];
    const s = craftState(rows, cols, mines, cellStates);

    const s2 = reducer(s, { type: "reveal", row: 0, col: 0 });
    // (0,0) has adj=0 so it should flood. Should reveal many cells.
    expect(s2.state[0]).toBe("revealed");
    expect(s2.revealedCount).toBeGreaterThan(1);
  });

  it("flood does not cross into mine cells", () => {
    // 3×3: mine at (1,1) center
    const mines = [
      false, false, false,
      false, true,  false,
      false, false, false,
    ];
    const cellStates: CellState[] = new Array(9).fill("hidden");
    const s = craftState(3, 3, mines, cellStates);
    // All 8 surrounding cells have adj=1, clicking (0,0) should only reveal (0,0)
    expect(s.adj![0]).toBe(1);
    const s2 = reducer(s, { type: "reveal", row: 0, col: 0 });
    expect(s2.revealedCount).toBe(1);
  });
});

// ─── Test 6: Revealing a mine sets lost=true ────────────────────────────────

describe("reveal mine", () => {
  it("sets lost=true and reveals all mines", () => {
    const mines = [
      true,  false, false,
      false, false, false,
      false, false, false,
    ];
    const cellStates: CellState[] = new Array(9).fill("hidden");
    const s = craftState(3, 3, mines, cellStates);

    const s2 = reducer(s, { type: "reveal", row: 0, col: 0 });
    expect(s2.lost).toBe(true);
    expect(s2.state[0]).toBe("revealed"); // mine revealed
  });

  it("no-op on reveal when already lost", () => {
    const mines = [true, false, false, false, false, false, false, false, false];
    const cellStates: CellState[] = new Array(9).fill("hidden");
    const s = craftState(3, 3, mines, cellStates, { lost: true });
    const s2 = reducer(s, { type: "reveal", row: 1, col: 1 });
    expect(s2).toBe(s); // same reference (no change)
  });
});

// ─── Test 7: Flagging ───────────────────────────────────────────────────────

describe("flag action", () => {
  it("flags a hidden cell, then unflags on second flag", () => {
    const s = initialState(1, beginnerSettings);
    const s2 = reducer(s, { type: "flag", row: 0, col: 0 });
    expect(s2.state[0]).toBe("flagged");
    expect(s2.flagsUsed).toBe(1);

    const s3 = reducer(s2, { type: "flag", row: 0, col: 0 });
    expect(s3.state[0]).toBe("hidden");
    expect(s3.flagsUsed).toBe(0);
  });
});

// ─── Test 8: Flagging a revealed cell is no-op ──────────────────────────────

describe("flag revealed cell", () => {
  it("flagging a revealed cell is a no-op", () => {
    const mines = [false, false, false, false, true, false, false, false, false];
    const cellStates: CellState[] = new Array(9).fill("hidden") as CellState[];
    cellStates[0] = "revealed";
    const s = craftState(3, 3, mines, cellStates);

    const s2 = reducer(s, { type: "flag", row: 0, col: 0 });
    expect(s2.state[0]).toBe("revealed");
    expect(s2.flagsUsed).toBe(0);
  });
});

// ─── Test 9: Chord reveals unflagged neighbors ──────────────────────────────

describe("chord action", () => {
  it("reveals unflagged neighbors when flag count matches adj", () => {
    // 3×3, mines at (0,0) and (0,2)
    const mines = [
      true,  false, true,
      false, false, false,
      false, false, false,
    ];
    // (1,1) center: adj=2, already revealed. (0,0) and (0,2) are flagged.
    const cellStates: CellState[] = new Array(9).fill("hidden") as CellState[];
    cellStates[4] = "revealed"; // (1,1)
    cellStates[0] = "flagged";  // (0,0) mine flagged
    cellStates[2] = "flagged";  // (0,2) mine flagged
    const s = craftState(3, 3, mines, cellStates, { flagsUsed: 2 });

    // adj of (1,1) should be 2
    expect(s.adj![4]).toBe(2);

    const s2 = reducer(s, { type: "chord", row: 1, col: 1 });
    // All previously hidden non-mine cells adjacent to (1,1): (0,1),(1,0),(1,2),(2,0),(2,1),(2,2)
    expect(s2.state[1]).toBe("revealed"); // (0,1)
    expect(s2.state[3]).toBe("revealed"); // (1,0)
    expect(s2.state[5]).toBe("revealed"); // (1,2)
    expect(s2.lost).toBe(false);
  });
});

// ─── Test 10: Chord with wrong flag count is no-op ──────────────────────────

describe("chord no-op", () => {
  it("chord with wrong flag count is a no-op", () => {
    const mines = [true, false, false, false, false, false, false, false, false];
    const cellStates: CellState[] = new Array(9).fill("hidden") as CellState[];
    cellStates[4] = "revealed"; // center revealed
    // (1,1) adj=1 but 0 flags placed
    const s = craftState(3, 3, mines, cellStates);
    const s2 = reducer(s, { type: "chord", row: 1, col: 1 });
    expect(s2).toBe(s);
  });
});

// ─── Test 11: Win condition ──────────────────────────────────────────────────

describe("win condition", () => {
  it("won=true when all non-mine cells revealed", () => {
    // 3×3, 1 mine at (2,2). Reveal all 8 non-mine cells.
    const mines = [
      false, false, false,
      false, false, false,
      false, false, true,
    ];
    // Reveal 7 cells; one more reveal should trigger won
    const cellStates: CellState[] = new Array(9).fill("revealed") as CellState[];
    cellStates[8] = "hidden"; // mine still hidden
    cellStates[7] = "hidden"; // last safe cell still hidden
    const s = craftState(3, 3, mines, cellStates, { revealedCount: 7 });
    // adj[7] = 1 (adjacent to mine at 8)
    const s2 = reducer(s, { type: "reveal", row: 2, col: 1 }); // idx=7
    expect(s2.won).toBe(true);
    expect(s2.revealedCount).toBe(8);
  });
});

// ─── Test 12: isTerminal ────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when game is ongoing", () => {
    const s = initialState(42, beginnerSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score=1000*revealedCount on win", () => {
    const s = initialState(42, beginnerSettings);
    const wonState: MinesweeperState = { ...s, won: true, revealedCount: 71, mines: [], adj: [] };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(71000);
  });

  it("returns score=0 on loss", () => {
    const s = initialState(42, beginnerSettings);
    const lostState: MinesweeperState = { ...s, lost: true, mines: [], adj: [] };
    const result = isTerminal(lostState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });
});

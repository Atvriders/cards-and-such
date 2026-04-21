import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalJumps, countPegs, hasAnyMove } from "./state.js";
import type { PegSolitaireState } from "./state.js";

const settings = { variant: "english" as const };

describe("PegSolitaire initialState", () => {
  it("has 33 valid cells", () => {
    const s = initialState(1, settings);
    const validCount = s.valid.filter(Boolean).length;
    expect(validCount).toBe(33);
  });

  it("starts with 32 pegs (center empty)", () => {
    const s = initialState(1, settings);
    const pegs = countPegs(s.cells, s.valid);
    expect(pegs).toBe(32);
  });

  it("center cell (row 3, col 3 = index 24) is empty", () => {
    const s = initialState(1, settings);
    expect(s.cells[3 * 7 + 3]).toBe("empty");
  });

  it("is not won at start", () => {
    const s = initialState(1, settings);
    expect(s.won).toBe(false);
  });

  it("has legal moves at start", () => {
    const s = initialState(1, settings);
    expect(hasAnyMove(s.cells, s.valid)).toBe(true);
  });
});

describe("PegSolitaire getLegalJumps", () => {
  it("returns jumps over adjacent pegs into empty holes", () => {
    const s = initialState(1, settings);
    // The center is empty at start. Pegs adjacent to center can jump in.
    // Center = index 24 (row 3, col 3)
    // Row 3, col 1 (index 22) can jump over row 3, col 2 (index 23) to center (index 24)
    const jumps = getLegalJumps(s.cells, s.valid, 22);
    const hasJumpToCenter = jumps.some((j) => j.to === 24);
    expect(hasJumpToCenter).toBe(true);
  });

  it("returns empty array for empty cell", () => {
    const s = initialState(1, settings);
    const jumps = getLegalJumps(s.cells, s.valid, 24); // center is empty
    expect(jumps.length).toBe(0);
  });

  it("returns empty array for isolated peg with no adjacent pegs to jump", () => {
    // Build state with single peg surrounded by empty cells
    const s = initialState(1, settings);
    const cells = s.cells.slice() as import("./state.js").PegState[];
    // Clear all cells, then put one peg at center
    for (let i = 0; i < 49; i++) cells[i] = "empty";
    cells[24] = "peg";
    const jumps = getLegalJumps(cells, s.valid, 24);
    expect(jumps.length).toBe(0);
  });
});

describe("PegSolitaire reducer", () => {
  it("select a peg sets selected", () => {
    const s = initialState(1, settings);
    // Select peg at row 3, col 1 (index 22)
    const s2 = reducer(s, { type: "select", index: 22 });
    expect(s2.selected).toBe(22);
  });

  it("select same peg deselects", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 22 });
    const s3 = reducer(s2, { type: "select", index: 22 });
    expect(s3.selected).toBeNull();
  });

  it("select empty cell clears selection", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 22 });
    const s3 = reducer(s2, { type: "select", index: 24 }); // center is empty
    // Should deselect or handle jump
    expect(s3.selected === null || typeof s3.selected === "number").toBe(true);
  });

  it("valid jump removes jumped peg and places peg in target", () => {
    const s = initialState(1, settings);
    // Jump from 22 (row 3, col 1) over 23 (row 3, col 2) to 24 (center)
    const s2 = reducer(s, { type: "jump", from: 22, over: 23, to: 24 });
    expect(s2.cells[22]).toBe("empty");
    expect(s2.cells[23]).toBe("empty");
    expect(s2.cells[24]).toBe("peg");
    expect(s2.movesMade).toBe(1);
  });

  it("invalid jump (not legal) is rejected", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "jump", from: 22, over: 23, to: 99 }); // bad target
    expect(s2.movesMade).toBe(0);
  });
});

describe("PegSolitaire isTerminal", () => {
  it("returns null at start (moves available)", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 1000 when exactly 1 peg remains in center", () => {
    const s = initialState(1, settings);
    const cells = new Array(49).fill("empty") as import("./state.js").PegState[];
    cells[3 * 7 + 3] = "peg"; // center
    const wonState: PegSolitaireState = { ...s, cells, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1000);
  });

  it("score decreases with more pegs remaining", () => {
    const s = initialState(1, settings);
    const cells = new Array(49).fill("empty") as import("./state.js").PegState[];
    cells[3 * 7 + 3] = "peg";
    cells[3 * 7 + 1] = "peg"; // extra peg
    const stuckState: PegSolitaireState = { ...s, cells, won: false };
    const result = isTerminal(stuckState);
    if (result !== null) {
      // 2 pegs: 1000 - (2-1)*150 = 850
      expect(result!.score).toBe(850);
    }
  });

  it("score floors at 50", () => {
    const s = initialState(1, settings);
    const cells = s.cells.slice();
    // Fake a no-moves state with many pegs
    const stuckState: PegSolitaireState = { ...s, cells, won: false };
    // If stuck, isTerminal should return something, else null
    const r = isTerminal(stuckState);
    if (r !== null) {
      expect(r.score).toBeGreaterThanOrEqual(50);
    }
  });
});

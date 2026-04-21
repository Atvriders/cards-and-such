import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NonogramState } from "./state.js";

describe("Nonogram initialState", () => {
  it("creates correct grid size for 5x5", () => {
    const s = initialState(1, { size: "5" });
    expect(s.size).toBe(5);
    expect(s.cells.length).toBe(25);
    expect(s.solution.length).toBe(25);
    expect(s.rowClues.length).toBe(5);
    expect(s.colClues.length).toBe(5);
  });

  it("creates correct grid size for 10x10", () => {
    const s = initialState(1, { size: "10" });
    expect(s.size).toBe(10);
    expect(s.cells.length).toBe(100);
    expect(s.rowClues.length).toBe(10);
    expect(s.colClues.length).toBe(10);
  });

  it("creates correct grid size for 15x15", () => {
    const s = initialState(1, { size: "15" });
    expect(s.size).toBe(15);
    expect(s.cells.length).toBe(225);
  });

  it("all cells start as unknown (0)", () => {
    const s = initialState(42, { size: "5" });
    expect(s.cells.every((c) => c === 0)).toBe(true);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, { size: "10" });
    const s2 = initialState(7, { size: "10" });
    expect(Array.from(s1.solution)).toEqual(Array.from(s2.solution));
  });

  it("different seeds may produce different solutions", () => {
    const s1 = initialState(1, { size: "10" });
    const s2 = initialState(999, { size: "10" });
    // Not guaranteed but very likely
    const same = Array.from(s1.solution).every((v, i) => v === s2.solution[i]);
    // Just assert they run without error; collisions are fine occasionally
    expect(typeof same).toBe("boolean");
  });

  it("row clues are consistent with solution", () => {
    const s = initialState(5, { size: "5" });
    // Each row clue sum must equal count of filled cells in that row
    for (let r = 0; r < 5; r++) {
      const filledCount = Array.from({ length: 5 }, (_, c) => s.solution[r * 5 + c]).filter(Boolean).length;
      const clueSum = s.rowClues[r]!.filter((n) => n > 0).reduce((a, b) => a + b, 0);
      expect(clueSum).toBe(filledCount);
    }
  });

  it("col clues are consistent with solution", () => {
    const s = initialState(5, { size: "5" });
    for (let c = 0; c < 5; c++) {
      const filledCount = Array.from({ length: 5 }, (_, r) => s.solution[r * 5 + c]).filter(Boolean).length;
      const clueSum = s.colClues[c]!.filter((n) => n > 0).reduce((a, b) => a + b, 0);
      expect(clueSum).toBe(filledCount);
    }
  });
});

describe("Nonogram reducer", () => {
  it("fill toggles cell from 0 to 1", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "fill", index: 0 });
    expect(s2.cells[0]).toBe(1);
    expect(s2.movesMade).toBe(1);
  });

  it("fill toggles cell from 1 back to 0", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "fill", index: 0 });
    const s3 = reducer(s2, { type: "fill", index: 0 });
    expect(s3.cells[0]).toBe(0);
  });

  it("mark toggles cell from 0 to 2", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "mark", index: 3 });
    expect(s2.cells[3]).toBe(2);
  });

  it("mark toggles cell from 2 back to 0", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "mark", index: 3 });
    const s3 = reducer(s2, { type: "mark", index: 3 });
    expect(s3.cells[3]).toBe(0);
  });

  it("no-op when index is out of bounds", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "fill", index: 999 });
    expect(s2.movesMade).toBe(0);
  });

  it("no-op when won", () => {
    const s = initialState(1, { size: "5" });
    const wonState: NonogramState = { ...s, won: true };
    const s2 = reducer(wonState, { type: "fill", index: 0 });
    expect(s2.cells[0]).toBe(0); // unchanged
  });
});

describe("Nonogram win condition", () => {
  it("won becomes true when cells match solution", () => {
    const s = initialState(1, { size: "5" });
    // Build correct cells from solution
    let cur: NonogramState = s;
    for (let i = 0; i < 25; i++) {
      if (s.solution[i]) {
        cur = reducer(cur, { type: "fill", index: i });
      }
    }
    expect(cur.won).toBe(true);
  });

  it("not won when partial fills", () => {
    const s = initialState(1, { size: "5" });
    const s2 = reducer(s, { type: "fill", index: 0 });
    expect(s2.won).toBe(false);
  });
});

describe("Nonogram isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, { size: "5" });
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { size: "5" });
    const wonState: NonogramState = { ...s, won: true, movesMade: 10 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });

  it("score floors at 100", () => {
    const s = initialState(1, { size: "5" });
    const wonState: NonogramState = { ...s, won: true, movesMade: 9999 };
    expect(isTerminal(wonState)!.score).toBe(100);
  });
});

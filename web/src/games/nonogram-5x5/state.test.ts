import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Nonogram5x5State } from "./state.js";

describe("Nonogram5x5 initialState", () => {
  it("creates a 5x5 grid", () => {
    const s = initialState(1, { difficulty: "medium" });
    expect(s.solution.length).toBe(25);
    expect(s.cells.length).toBe(25);
    expect(s.rowClues.length).toBe(5);
    expect(s.colClues.length).toBe(5);
  });

  it("all cells start unknown", () => {
    const s = initialState(42, { difficulty: "easy" });
    expect(s.cells.every((c) => c === 0)).toBe(true);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, { difficulty: "hard" });
    const s2 = initialState(7, { difficulty: "hard" });
    expect(Array.from(s1.solution)).toEqual(Array.from(s2.solution));
  });

  it("row clues match solution", () => {
    const s = initialState(5, { difficulty: "medium" });
    for (let r = 0; r < 5; r++) {
      const filled = Array.from({ length: 5 }, (_, c) => s.solution[r * 5 + c]).filter(Boolean).length;
      const clueSum = s.rowClues[r]!.filter((n) => n > 0).reduce((a, b) => a + b, 0);
      expect(clueSum).toBe(filled);
    }
  });
});

describe("Nonogram5x5 reducer", () => {
  it("fill toggles cell to 1", () => {
    const s = initialState(1, { difficulty: "medium" });
    const s2 = reducer(s, { type: "fill", index: 0 });
    expect(s2.cells[0]).toBe(1);
    expect(s2.movesMade).toBe(1);
  });

  it("fill toggles back to 0", () => {
    const s = initialState(1, { difficulty: "medium" });
    const s2 = reducer(reducer(s, { type: "fill", index: 0 }), { type: "fill", index: 0 });
    expect(s2.cells[0]).toBe(0);
  });

  it("mark sets cell to 2", () => {
    const s = initialState(1, { difficulty: "medium" });
    const s2 = reducer(s, { type: "mark", index: 3 });
    expect(s2.cells[3]).toBe(2);
  });

  it("out-of-bounds index is a no-op", () => {
    const s = initialState(1, { difficulty: "medium" });
    const s2 = reducer(s, { type: "fill", index: 100 });
    expect(s2.movesMade).toBe(0);
  });

  it("no-op when already won", () => {
    const s = initialState(1, { difficulty: "medium" });
    const won: Nonogram5x5State = { ...s, won: true };
    expect(reducer(won, { type: "fill", index: 0 }).cells[0]).toBe(0);
  });
});

describe("Nonogram5x5 isTerminal", () => {
  it("returns null when not solved", () => {
    expect(isTerminal(initialState(1, { difficulty: "medium" }))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { difficulty: "medium" });
    let cur: Nonogram5x5State = s;
    for (let i = 0; i < 25; i++) {
      if (s.solution[i]) cur = reducer(cur, { type: "fill", index: i });
    }
    expect(cur.won).toBe(true);
    expect(isTerminal(cur)).not.toBeNull();
  });

  it("score floors at 100", () => {
    const s = initialState(1, { difficulty: "medium" });
    const won: Nonogram5x5State = { ...s, won: true, movesMade: 9999 };
    expect(isTerminal(won)!.score).toBe(100);
  });
});

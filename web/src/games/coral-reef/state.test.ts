import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CoralReefSettings } from "./state.js";

const s4: CoralReefSettings = { size: "4" };
const s5: CoralReefSettings = { size: "5" };

describe("CoralReef initialState", () => {
  it("4x4 grid has 16 cells", () => {
    expect(initialState(1, s4).grid).toHaveLength(16);
  });

  it("5x5 grid has 25 cells", () => {
    expect(initialState(1, s5).grid).toHaveLength(25);
  });

  it("starts with 0 collected and 0 moves", () => {
    const s = initialState(1, s4);
    expect(s.collected).toBe(0);
    expect(s.moves).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s4).gameOver).toBe(false);
  });
});

describe("CoralReef reducer", () => {
  it("selecting empty tile does nothing", () => {
    const s = initialState(1, s4);
    const emptyIdx = s.grid.findIndex(c => c === "empty");
    if (emptyIdx !== -1) {
      const s2 = reducer(s, { type: "select", idx: emptyIdx });
      expect(s2.moves).toBe(0);
    }
  });

  it("restart resets state", () => {
    let s = initialState(1, s4);
    s = reducer(s, { type: "restart" });
    expect(s.collected).toBe(0);
    expect(s.moves).toBe(0);
  });

  it("selecting an isolated tile shows message", () => {
    // Build a state where index 0 is coral and all neighbours are fish
    const s = initialState(1, s4);
    const forceGrid = s.grid.map((_, i) => {
      if (i === 0) return "coral" as const;
      if (i === 1 || i === 4) return "fish" as const;
      return "empty" as const;
    });
    const isolated = { ...s, grid: forceGrid };
    const s2 = reducer(isolated, { type: "select", idx: 0 });
    expect(s2.moves).toBe(0); // no move made
  });

  it("clearing a group increments moves and collected", () => {
    const s = initialState(1, s4);
    // force indices 0 and 1 to same type
    const forceGrid = s.grid.map((c, i) => (i === 0 || i === 1) ? "coral" as const : c);
    const forced = { ...s, grid: forceGrid };
    const s2 = reducer(forced, { type: "select", idx: 0 });
    expect(s2.moves).toBe(1);
    expect(s2.collected).toBeGreaterThanOrEqual(2);
  });
});

describe("CoralReef isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s4))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s4), gameOver: true, collected: 10, pearls: 2, moves: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});

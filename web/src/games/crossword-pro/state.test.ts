import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easySettings = { difficulty: "easy" as const };
const hardSettings = { difficulty: "hard" as const };

describe("CrosswordPro initialState", () => {
  it("creates easy puzzle with 5x5 grid", () => {
    const s = initialState(42, easySettings);
    expect(s.size).toBe(5);
    expect(s.grid).toHaveLength(25);
    expect(s.won).toBe(false);
    expect(s.reveals).toBe(0);
  });

  it("black cells are marked as # in grid", () => {
    const s = initialState(42, easySettings);
    const blacks = s.grid.filter(v => v === "#");
    expect(blacks.length).toBeGreaterThan(0);
  });

  it("non-black cells start empty", () => {
    const s = initialState(42, easySettings);
    for (let i = 0; i < s.grid.length; i++) {
      if (s.grid[i] !== "#") expect(s.grid[i]).toBe("");
    }
  });

  it("hard puzzle has 7x7 grid", () => {
    const s = initialState(1, hardSettings);
    expect(s.size).toBe(7);
    expect(s.grid).toHaveLength(49);
  });
});

describe("CrosswordPro reducer", () => {
  it("type action fills a cell with correct letter", () => {
    const s = initialState(42, easySettings);
    // Find a non-black cell
    let idx = 0;
    for (let i = 0; i < s.grid.length; i++) {
      if (s.grid[i] !== "#") { idx = i; break; }
    }
    const row = Math.floor(idx / s.size);
    const col = idx % s.size;
    const s2 = reducer(s, { type: "type", row, col, letter: "A" });
    expect(s2.grid[idx]).toBe("A");
  });

  it("select action updates selectedClue", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer(s, { type: "select", clueIndex: 0 });
    expect(s2.selectedClue).toBe(0);
  });

  it("reveal fills one wrong cell", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer(s, { type: "reveal" });
    expect(s2.reveals).toBe(1);
    const filled = s2.grid.filter((v, i) => s2.solution[i] !== "#" && v !== "").length;
    expect(filled).toBeGreaterThan(0);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, easySettings);
    expect(isTerminal(s)).toBeNull();
  });
});

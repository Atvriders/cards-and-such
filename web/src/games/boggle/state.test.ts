import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, areAdjacent, isValidPath, pathToWord, wordScore } from "./state.js";

const defaultSettings = { size: "4" as const, duration: "180" as const };

describe("Boggle initialState", () => {
  it("creates a 4x4 grid with 16 letters", () => {
    const s = initialState(1, defaultSettings);
    expect(s.grid.length).toBe(16);
    expect(s.gridSize).toBe(4);
    s.grid.forEach(l => expect(/^[A-Z]$/.test(l)).toBe(true));
  });

  it("creates a 5x5 grid with 25 letters", () => {
    const s = initialState(1, { size: "5", duration: "180" });
    expect(s.grid.length).toBe(25);
    expect(s.gridSize).toBe(5);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.grid).toEqual(s2.grid);
  });

  it("starts with empty state", () => {
    const s = initialState(1, defaultSettings);
    expect(s.currentPath).toEqual([]);
    expect(s.foundWords).toEqual([]);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
  });
});

describe("Boggle areAdjacent", () => {
  it("recognises adjacent cells horizontally", () => {
    // 4x4: cells 0(0,0) and 1(0,1) are adjacent
    expect(areAdjacent(0, 1, 4)).toBe(true);
  });

  it("recognises adjacent cells diagonally", () => {
    // 4x4: cell 0(0,0) and 5(1,1) are diagonal
    expect(areAdjacent(0, 5, 4)).toBe(true);
  });

  it("returns false for non-adjacent cells", () => {
    // 4x4: cell 0(0,0) and 2(0,2) — distance 2
    expect(areAdjacent(0, 2, 4)).toBe(false);
  });

  it("returns false for same cell", () => {
    expect(areAdjacent(3, 3, 4)).toBe(false);
  });
});

describe("Boggle isValidPath", () => {
  it("validates a simple adjacent path", () => {
    expect(isValidPath([0, 1, 2], 4)).toBe(true);
  });

  it("rejects a path with a revisited cell", () => {
    expect(isValidPath([0, 1, 0], 4)).toBe(false);
  });

  it("rejects a path with non-adjacent step", () => {
    expect(isValidPath([0, 2], 4)).toBe(false);
  });
});

describe("Boggle wordScore", () => {
  it("scores 3-letter words as 1", () => expect(wordScore(3)).toBe(1));
  it("scores 5-letter words as 2", () => expect(wordScore(5)).toBe(2));
  it("scores 7-letter words as 5", () => expect(wordScore(7)).toBe(5));
  it("scores 8-letter words as 11", () => expect(wordScore(8)).toBe(11));
});

describe("Boggle reducer", () => {
  it("selectCell adds to path", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    expect(s2.currentPath).toEqual([0]);
  });

  it("selectCell rejects non-adjacent cell", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    const s3 = reducer(s2, { type: "selectCell", index: 15 }); // far corner — not adjacent to 0
    expect(s3.error).toBeTruthy();
  });

  it("clearPath resets path", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    const s3 = reducer(s2, { type: "clearPath" });
    expect(s3.currentPath).toEqual([]);
  });

  it("submitWord with less than 3 letters sets error", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    const s3 = reducer(s2, { type: "selectCell", index: 1 });
    const s4 = reducer(s3, { type: "submitWord" });
    expect(s4.error).toBeTruthy();
    expect(s4.currentPath).toEqual([]);
  });

  it("tick decrements timeLeft", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(s.timeLeft - 1);
  });

  it("tick sets done when timeLeft reaches 0", () => {
    const s = { ...initialState(1, defaultSettings), timeLeft: 1 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.done).toBe(true);
  });

  it("no actions accepted after done", () => {
    const s = { ...initialState(1, defaultSettings), done: true };
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    expect(s2).toBe(s);
  });

  it("submitWord accepts a known word built from grid", () => {
    // Build a state where the grid spells ACE in positions 0,1,2
    const base = initialState(1, defaultSettings);
    // Override grid so cells 0,1,2 = A,C,E
    const grid = [...base.grid];
    grid[0] = "A"; grid[1] = "C"; grid[2] = "E";
    const s = { ...base, grid };
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    const s3 = reducer(s2, { type: "selectCell", index: 1 });
    const s4 = reducer(s3, { type: "selectCell", index: 2 });
    const s5 = reducer(s4, { type: "submitWord" });
    expect(s5.foundWords).toContain("ACE");
    expect(s5.score).toBe(1);
  });

  it("submitWord rejects already found word", () => {
    const base = initialState(1, defaultSettings);
    const grid = [...base.grid];
    grid[0] = "A"; grid[1] = "C"; grid[2] = "E";
    const s = { ...base, grid, foundWords: ["ACE"] };
    const s2 = reducer(s, { type: "selectCell", index: 0 });
    const s3 = reducer(s2, { type: "selectCell", index: 1 });
    const s4 = reducer(s3, { type: "selectCell", index: 2 });
    const s5 = reducer(s4, { type: "submitWord" });
    expect(s5.error).toMatch(/already/i);
  });

  it("pathToWord converts indices to letters", () => {
    const grid = ["A", "B", "C", "D"];
    expect(pathToWord([0, 2, 1], grid)).toBe("ACB");
  });
});

describe("Boggle isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(1, defaultSettings), done: true, score: 42 };
    expect(isTerminal(s)).toEqual({ score: 42 });
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { gridSize: "8" as const, submarines: "3" as const };

describe("initialState", () => {
  it("creates grid with all unknown cells", () => {
    const s = initialState(1, defaultSettings);
    expect(s.grid.every((row) => row.every((c) => c === "unknown"))).toBe(true);
    expect(s.over).toBe(false);
    expect(s.shots).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("fire action", () => {
  it("firing changes cell from unknown to miss or hit", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "fire", row: 0, col: 0 });
    expect(after.grid[0]![0]).not.toBe("unknown");
    expect(after.shots).toBe(1);
  });

  it("cannot fire on already-fired cell", () => {
    const s = initialState(1, defaultSettings);
    const after1 = reducer(s, { type: "fire", row: 0, col: 0 });
    const after2 = reducer(after1, { type: "fire", row: 0, col: 0 });
    expect(after2.shots).toBe(1); // still 1, second fire ignored
  });

  it("hitting a submarine increases hits count", () => {
    const s = initialState(1, defaultSettings);
    // Fire at every cell to find a hit
    let foundHit = false;
    let current = s;
    outer: for (let r = 0; r < s.gridSize; r++) {
      for (let c = 0; c < s.gridSize; c++) {
        const after = reducer(current, { type: "fire", row: r, col: c });
        if (after.hits > current.hits) {
          foundHit = true;
          break outer;
        }
        current = after;
      }
    }
    expect(foundHit).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 250 };
    expect(isTerminal(s)?.score).toBe(250);
  });
});

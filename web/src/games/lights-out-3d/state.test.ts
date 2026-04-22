import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getToggles, indexToXYZ, xyzToIndex, countOn } from "./state.js";

const settings = { difficulty: "easy" as const };

describe("LightsOut3D indexToXYZ / xyzToIndex", () => {
  it("round-trips correctly", () => {
    for (let i = 0; i < 27; i++) {
      const [x, y, z] = indexToXYZ(i);
      expect(xyzToIndex(x, y, z)).toBe(i);
    }
  });

  it("center cell is (1,1,1) = index 13", () => {
    expect(xyzToIndex(1, 1, 1)).toBe(13);
    expect(indexToXYZ(13)).toEqual([1, 1, 1]);
  });
});

describe("LightsOut3D getToggles", () => {
  it("center cell (13) has 7 toggles (itself + 6 neighbors)", () => {
    expect(getToggles(13).length).toBe(7);
  });

  it("corner cell (0) has 4 toggles (itself + 3 neighbors)", () => {
    // (0,0,0) neighbors: (1,0,0), (0,1,0), (0,0,1)
    expect(getToggles(0).length).toBe(4);
  });

  it("always includes the pressed cell itself", () => {
    for (let i = 0; i < 27; i++) {
      expect(getToggles(i)).toContain(i);
    }
  });

  it("all toggle targets are valid indices 0-26", () => {
    for (let i = 0; i < 27; i++) {
      for (const t of getToggles(i)) {
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThan(27);
      }
    }
  });
});

describe("LightsOut3D initialState", () => {
  it("has 27 cells", () => {
    const s = initialState(1, settings);
    expect(s.cells.length).toBe(27);
  });

  it("starts with 0 moves", () => {
    const s = initialState(1, settings);
    expect(s.moves).toBe(0);
  });

  it("easy puzzle has few lights on", () => {
    const s = initialState(1, settings);
    expect(countOn(s.cells)).toBeLessThanOrEqual(15);
  });
});

describe("LightsOut3D reducer", () => {
  it("press toggles the target cell and neighbors", () => {
    const s = initialState(1, settings);
    const before = [...s.cells];
    const s2 = reducer(s, { type: "press", index: 13 }); // center
    const toggles = getToggles(13);
    for (let i = 0; i < 27; i++) {
      if (toggles.includes(i)) {
        expect(s2.cells[i]).toBe(!before[i]);
      } else {
        expect(s2.cells[i]).toBe(before[i]);
      }
    }
  });

  it("increments moves on each press", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "press", index: 0 });
    expect(s2.moves).toBe(1);
  });

  it("pressing all cells twice returns to original state", () => {
    const s = initialState(1, settings);
    let s2 = s;
    for (let i = 0; i < 27; i++) s2 = reducer(s2, { type: "press", index: i });
    for (let i = 0; i < 27; i++) s2 = reducer(s2, { type: "press", index: i });
    expect(s2.cells).toEqual(s.cells);
  });

  it("won state is not modified on further press", () => {
    const s = initialState(1, settings);
    const allOff = { ...s, cells: new Array(27).fill(false), won: true };
    const s2 = reducer(allOff, { type: "press", index: 0 });
    expect(s2.won).toBe(true);
    expect(s2.cells).toEqual(allOff.cells);
  });
});

describe("LightsOut3D isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, settings);
    if (!s.won) expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all off", () => {
    const s = initialState(1, settings);
    const won = { ...s, cells: new Array(27).fill(false), won: true, moves: 5 };
    expect(isTerminal(won)).toEqual({ score: 275 });
  });

  it("score floors at 10", () => {
    const s = initialState(1, settings);
    const won = { ...s, cells: new Array(27).fill(false), won: true, moves: 999 };
    expect(isTerminal(won)!.score).toBe(10);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SubmarineSonarSettings } from "./state.js";

const settings: SubmarineSonarSettings = { gridSize: "6" };

describe("SubmarineSonar initialState", () => {
  it("creates a 6x6 grid of unknown cells", () => {
    const s = initialState(1, settings);
    expect(s.grid).toHaveLength(36);
    expect(s.grid.every(c => c === "unknown")).toBe(true);
  });

  it("places a submarine of correct length", () => {
    const s = initialState(1, settings);
    expect(s.subCells).toHaveLength(3); // size=6 → length=3
  });

  it("submarine cells are within grid bounds", () => {
    const s = initialState(42, settings);
    for (const c of s.subCells) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(36);
    }
  });
});

describe("SubmarineSonar reducer", () => {
  it("marks a miss on non-submarine cell", () => {
    const s = initialState(1, settings);
    // Find a cell not in subCells
    const missCell = Array.from({ length: 36 }, (_, i) => i).find(i => !s.subCells.includes(i))!;
    const s2 = reducer(s, { type: "ping", cell: missCell });
    expect(s2.grid[missCell]).toBe("miss");
    expect(s2.pings).toBe(1);
  });

  it("marks a hit on submarine cell", () => {
    const s = initialState(1, settings);
    const hitCell = s.subCells[0]!;
    const s2 = reducer(s, { type: "ping", cell: hitCell });
    expect(s2.grid[hitCell]).toBe("hit");
    expect(s2.hitsFound).toBe(1);
  });

  it("ignores repeated ping on same cell", () => {
    const s = initialState(1, settings);
    const missCell = Array.from({ length: 36 }, (_, i) => i).find(i => !s.subCells.includes(i))!;
    const s2 = reducer(s, { type: "ping", cell: missCell });
    const s3 = reducer(s2, { type: "ping", cell: missCell });
    expect(s3.pings).toBe(1);
  });

  it("game ends and won=true when all sub cells hit", () => {
    let s = initialState(1, settings);
    for (const cell of s.subCells) {
      s = reducer(s, { type: "ping", cell });
    }
    expect(s.gameOver).toBe(true);
    expect(s.won).toBe(true);
  });

  it("restart creates fresh state", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "ping", cell: 0 });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.pings).toBe(0);
    expect(s2.gameOver).toBe(false);
  });
});

describe("SubmarineSonar isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns a score when won", () => {
    let s = initialState(1, settings);
    for (const cell of s.subCells) {
      s = reducer(s, { type: "ping", cell });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});

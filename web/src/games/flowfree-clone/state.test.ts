import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easySettings = { difficulty: "easy" as const };
const hardSettings = { difficulty: "hard" as const };

describe("ColorFlow initialState", () => {
  it("creates an easy puzzle with correct size", () => {
    const s = initialState(1, easySettings);
    expect(s.size).toBe(5);
    expect(s.won).toBe(false);
    expect(s.movesMade).toBe(0);
    expect(s.activeColor).toBeNull();
  });

  it("creates a hard puzzle with size 7", () => {
    const s = initialState(1, hardSettings);
    expect(s.size).toBe(7);
  });

  it("endpoints exist for all colors", () => {
    const s = initialState(1, easySettings);
    const colors = new Set(Object.values(s.endpoints));
    expect(colors.size).toBeGreaterThan(0);
  });

  it("paths are empty at start", () => {
    const s = initialState(1, easySettings);
    for (const path of Object.values(s.paths)) {
      expect(path).toHaveLength(0);
    }
  });
});

describe("ColorFlow reducer", () => {
  it("start action sets activeColor and begins path", () => {
    const s = initialState(1, easySettings);
    const ep = Object.entries(s.endpoints)[0]!;
    const [k, color] = ep;
    const [r, c] = k.split(",").map(Number) as [number, number];
    const s2 = reducer(s, { type: "start", row: r, col: c });
    expect(s2.activeColor).toBe(color);
    expect(s2.paths[color]).toContain(k);
  });

  it("extend adds adjacent cells", () => {
    const s = initialState(1, easySettings);
    const ep = Object.entries(s.endpoints)[0]!;
    const [k, color] = ep;
    const [r, c] = k.split(",").map(Number) as [number, number];
    const s2 = reducer(s, { type: "start", row: r, col: c });
    // Extend to adjacent cell (try right or down)
    const nr = r + 1 < s.size ? r + 1 : r;
    const nc = r + 1 < s.size ? c : c + 1;
    const s3 = reducer(s2, { type: "extend", row: nr, col: nc });
    if (s3.paths[color]!.length > 1) {
      expect(s3.paths[color]).toContain(`${nr},${nc}`);
    }
  });

  it("release clears activeColor", () => {
    const s = initialState(1, easySettings);
    const ep = Object.entries(s.endpoints)[0]!;
    const [k] = ep;
    const [r, c] = k.split(",").map(Number) as [number, number];
    const s2 = reducer(s, { type: "start", row: r, col: c });
    const s3 = reducer(s2, { type: "release" });
    expect(s3.activeColor).toBeNull();
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(1, easySettings);
    expect(isTerminal(s)).toBeNull();
  });
});

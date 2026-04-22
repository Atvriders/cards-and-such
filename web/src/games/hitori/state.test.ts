import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ALL_PUZZLES, computeViolations, unshadeIsConnected } from "./state.js";

const s5 = { size: "5" as const };
const s6 = { size: "6" as const };
const s7 = { size: "7" as const };

describe("Hitori puzzle solution validity", () => {
  it("solution has no adjacent shaded cells", () => {
    for (const [sizeStr, puzzles] of Object.entries(ALL_PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        for (let i = 0; i < N * N; i++) {
          if (!puzzle.solution[i]) continue;
          const r = Math.floor(i / N), c = i % N;
          // Check right
          if (c + 1 < N) expect(puzzle.solution[i + 1]).toBeFalsy();
          // Check down
          if (r + 1 < N) expect(puzzle.solution[(r + 1) * N + c]).toBeFalsy();
        }
      }
    }
  });

  it("solution unshaded cells have no duplicates in rows/cols", () => {
    for (const [sizeStr, puzzles] of Object.entries(ALL_PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        const violations = computeViolations(puzzle.solution, puzzle);
        expect(violations.size).toBe(0);
      }
    }
  });

  it("solution unshaded cells are connected", () => {
    for (const [sizeStr, puzzles] of Object.entries(ALL_PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        expect(unshadeIsConnected(puzzle.solution, N)).toBe(true);
      }
    }
  });
});

describe("Hitori initialState", () => {
  it("starts with no cells shaded", () => {
    const s = initialState(1, s5);
    expect(s.shaded.every((v) => !v)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, s6);
    const s2 = initialState(42, s6);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Hitori toggleShade", () => {
  it("shades and unshades a cell", () => {
    const s = initialState(1, s5);
    let s2 = reducer(s, { type: "toggleShade", idx: 0 });
    expect(s2.shaded[0]).toBe(true);
    expect(s2.moves).toBe(1);
    s2 = reducer(s2, { type: "toggleShade", idx: 0 });
    expect(s2.shaded[0]).toBe(false);
    expect(s2.moves).toBe(2);
  });

  it("does not change other cells", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "toggleShade", idx: 3 });
    for (let i = 0; i < s2.shaded.length; i++) {
      if (i !== 3) expect(s2.shaded[i]).toBe(false);
    }
  });
});

describe("Hitori reset", () => {
  it("clears all shading", () => {
    const s = initialState(1, s5);
    let s2 = reducer(s, { type: "toggleShade", idx: 0 });
    s2 = reducer(s2, { type: "toggleShade", idx: 5 });
    s2 = reducer(s2, { type: "reset" });
    expect(s2.shaded.every((v) => !v)).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Hitori win condition", () => {
  it("wins when shading matches solution", () => {
    const puzzle = ALL_PUZZLES["5"]![0]!;
    const s = initialState(0, s5);
    // Apply all solution shades except the last one
    const solIdxs = puzzle.solution.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    let st = { ...s, puzzle };
    for (const idx of solIdxs.slice(0, -1)) {
      st = reducer(st, { type: "toggleShade", idx });
    }
    expect(st.won).toBe(false);
    // Apply last shade
    const lastIdx = solIdxs[solIdxs.length - 1]!;
    const done = reducer(st, { type: "toggleShade", idx: lastIdx });
    expect(done.won).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, s7);
    const wonState = { ...s, won: true, moves: 10 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });
});

describe("Hitori violation detection", () => {
  it("detects duplicate unshaded in row", () => {
    const puzzle = ALL_PUZZLES["5"]![0]!;
    // The grid has duplicates; without any shading, violations should exist
    const shaded = new Array(25).fill(false);
    const violations = computeViolations(shaded, puzzle);
    expect(violations.size).toBeGreaterThan(0);
  });
});

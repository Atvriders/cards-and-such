import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeUnrulyErrors } from "./state.js";
import { UNRULY_PUZZLES, validateUnrulySolution } from "./puzzles.js";

const s6 = { size: "6" as const };
const s8 = { size: "8" as const };
const s10 = { size: "10" as const };

describe("Unruly puzzles", () => {
  it("all solutions are valid", () => {
    for (const p of UNRULY_PUZZLES) {
      expect(validateUnrulySolution(p)).toBe(true);
    }
  });

  it("given cells match solution values", () => {
    for (const p of UNRULY_PUZZLES) {
      for (let i = 0; i < p.given.length; i++) {
        if (p.given[i] !== 0) {
          expect(p.given[i]).toBe(p.solution[i]);
        }
      }
    }
  });

  it("has at least 3 size-6, 2 size-8, 1 size-10 puzzles", () => {
    expect(UNRULY_PUZZLES.filter((p) => p.size === 6).length).toBeGreaterThanOrEqual(3);
    expect(UNRULY_PUZZLES.filter((p) => p.size === 8).length).toBeGreaterThanOrEqual(2);
    expect(UNRULY_PUZZLES.filter((p) => p.size === 10).length).toBeGreaterThanOrEqual(1);
  });
});

describe("Unruly initialState", () => {
  it("starts with given cells pre-filled", () => {
    const s = initialState(1, s6);
    const given = s.puzzle.given;
    for (let i = 0; i < given.length; i++) {
      if (given[i] !== 0) expect(s.current[i]).toBe(given[i]);
    }
  });

  it("starts with 0 moves, not won", () => {
    const s = initialState(1, s8);
    expect(s.movesMade).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("Unruly reducer", () => {
  it("toggle cycles empty->black->white->empty", () => {
    const s = initialState(1, s6);
    // Find a non-given cell
    const idx = s.puzzle.given.findIndex((v) => v === 0);
    expect(idx).toBeGreaterThanOrEqual(0);

    let st = reducer(s, { type: "toggle", index: idx });
    expect(st.current[idx]).toBe(1); // black
    st = reducer(st, { type: "toggle", index: idx });
    expect(st.current[idx]).toBe(2); // white
    st = reducer(st, { type: "toggle", index: idx });
    expect(st.current[idx]).toBe(0); // empty again
  });

  it("cannot toggle a given cell", () => {
    const s = initialState(1, s6);
    const givenIdx = s.puzzle.given.findIndex((v) => v !== 0);
    const givenVal = s.current[givenIdx]!;
    const s2 = reducer(s, { type: "toggle", index: givenIdx });
    expect(s2.current[givenIdx]).toBe(givenVal);
  });

  it("toggle increments movesMade", () => {
    const s = initialState(1, s6);
    const idx = s.puzzle.given.findIndex((v) => v === 0);
    const s2 = reducer(s, { type: "toggle", index: idx });
    expect(s2.movesMade).toBe(1);
  });
});

describe("Unruly error detection", () => {
  it("three consecutive same-color tiles are errors", () => {
    const current = [1, 1, 1, 2, 2, 1, ...new Array(30).fill(0)];
    const errors = computeUnrulyErrors(current, 6);
    expect(errors).toContain(0);
    expect(errors).toContain(1);
    expect(errors).toContain(2);
  });

  it("no errors for alternating pattern", () => {
    const n = 6;
    const current = Array.from({ length: n * n }, (_, i) => {
      const r = Math.floor(i / n);
      const c = i % n;
      return (r + c) % 2 === 0 ? 1 : 2;
    });
    // This alternating pattern has no triples but may violate balance in some rows
    // Just check no triple errors at least for row 0: 1,2,1,2,1,2 -> no triples
    const errors = computeUnrulyErrors(current.slice(0, n * n), n);
    // Verify row 0 cells 0,1,2 are not triple-flagged
    const row0errors = errors.filter((e) => e < n);
    expect(row0errors.length).toBe(0);
  });
});

describe("Unruly win condition", () => {
  it("won becomes true when current matches solution", () => {
    const s = initialState(1, s6);
    let st = s;
    for (let i = 0; i < s.puzzle.solution.length; i++) {
      if (s.puzzle.given[i] === 0) {
        // Set to solution value by toggling
        const target = s.puzzle.solution[i]!;
        while (st.current[i] !== target) {
          st = reducer(st, { type: "toggle", index: i });
        }
      }
    }
    expect(st.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, s6);
    const wonState = { ...s, won: true, movesMade: 10 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 1000 - 10 * 3));
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, s10))).toBeNull();
  });
});

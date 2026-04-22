import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeStarErrors } from "./state.js";
import { STAR_BATTLE_PUZZLES, validateStarBattle } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };
const hard = { difficulty: "hard" as const };

describe("StarBattle puzzles", () => {
  it("all solutions pass validateStarBattle", () => {
    for (const p of STAR_BATTLE_PUZZLES) {
      expect(validateStarBattle(p)).toBe(true);
    }
  });

  it("has at least 4 easy, 1 medium, 1 hard puzzle", () => {
    expect(STAR_BATTLE_PUZZLES.filter((p) => p.difficulty === "easy").length).toBeGreaterThanOrEqual(4);
    expect(STAR_BATTLE_PUZZLES.filter((p) => p.difficulty === "medium").length).toBeGreaterThanOrEqual(1);
    expect(STAR_BATTLE_PUZZLES.filter((p) => p.difficulty === "hard").length).toBeGreaterThanOrEqual(1);
  });

  it("solution arrays have correct length", () => {
    for (const p of STAR_BATTLE_PUZZLES) {
      expect(p.solution.length).toBe(p.n * p.n);
      expect(p.regions.length).toBe(p.n * p.n);
    }
  });
});

describe("StarBattle initialState", () => {
  it("starts with all cells empty, 0 moves, not won", () => {
    const s = initialState(1, easy);
    expect(s.marks.every((v) => v === 0)).toBe(true);
    expect(s.movesMade).toBe(0);
    expect(s.won).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle.id).toBe(s2.puzzle.id);
  });
});

describe("StarBattle reducer", () => {
  it("toggle cycles 0→1→2→0", () => {
    const s = initialState(1, easy);
    let st = reducer(s, { type: "toggle", index: 0 });
    expect(st.marks[0]).toBe(1);
    st = reducer(st, { type: "toggle", index: 0 });
    expect(st.marks[0]).toBe(2);
    st = reducer(st, { type: "toggle", index: 0 });
    expect(st.marks[0]).toBe(0);
  });

  it("toggle increments movesMade", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggle", index: 5 });
    expect(s2.movesMade).toBe(1);
  });
});

describe("StarBattle error detection", () => {
  it("adjacent stars are flagged as errors", () => {
    const s = initialState(1, easy);
    // Place two adjacent stars
    const marks = new Array(s.puzzle.n * s.puzzle.n).fill(0);
    marks[0] = 1;
    marks[1] = 1; // adjacent to marks[0]
    const errors = computeStarErrors(marks, s.puzzle);
    expect(errors).toContain(0);
    expect(errors).toContain(1);
  });

  it("non-adjacent stars in different rows/cols don't trigger adjacency error", () => {
    const s = initialState(1, easy);
    const n = s.puzzle.n;
    const marks = new Array(n * n).fill(0);
    // Stars at (0,0) and (2,2) -- not adjacent (diag diff = 2)
    marks[0] = 1;
    marks[2 * n + 2] = 1;
    const errors = computeStarErrors(marks, s.puzzle);
    // No adjacency error for these two
    const adjErrors = errors.filter((e) => e === 0 || e === 2 * n + 2);
    // They should not be adjacent
    expect(adjErrors.length).toBe(0);
  });

  it("placing correct solution stars produces no errors", () => {
    const s = initialState(1, easy);
    const marks = s.puzzle.solution.map((v) => (v ? 1 : 0));
    const errors = computeStarErrors(marks, s.puzzle);
    expect(errors).toHaveLength(0);
  });
});

describe("StarBattle win condition", () => {
  it("won becomes true when stars match solution exactly", () => {
    const s = initialState(1, easy);
    let st = s;
    for (let i = 0; i < s.puzzle.solution.length; i++) {
      if (s.puzzle.solution[i]) {
        st = reducer(st, { type: "toggle", index: i });
        // Toggle once to get star (value 1)
      }
    }
    expect(st.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, medium);
    const wonState = { ...s, won: true, movesMade: 15 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 1000 - 15 * 5));
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, hard))).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Yajilin initialState", () => {
  it("starts with all empty cells, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.cells.every(c => c === "empty")).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("hard puzzle is larger than easy", () => {
    const e = initialState(1, easy);
    const h = initialState(1, hard);
    expect(h.puzzle.size).toBeGreaterThan(e.puzzle.size);
  });
});

describe("Yajilin clickCell", () => {
  it("cycles empty → loop → shaded → empty", () => {
    const s = initialState(1, easy);
    const nonClueIdx = Array.from({ length: s.puzzle.size ** 2 }, (_, i) => i)
      .find(i => !s.puzzle.clues.some(c => c.idx === i))!;
    let s2 = reducer(s, { type: "clickCell", idx: nonClueIdx });
    expect(s2.cells[nonClueIdx]).toBe("loop");
    s2 = reducer(s2, { type: "clickCell", idx: nonClueIdx });
    expect(s2.cells[nonClueIdx]).toBe("shaded");
    s2 = reducer(s2, { type: "clickCell", idx: nonClueIdx });
    expect(s2.cells[nonClueIdx]).toBe("empty");
  });

  it("cannot click a clue cell", () => {
    const s = initialState(1, easy);
    const clueIdx = s.puzzle.clues[0]!.idx;
    const s2 = reducer(s, { type: "clickCell", idx: clueIdx });
    expect(s2.cells[clueIdx]).toBe("empty");
    expect(s2.moves).toBe(0);
  });

  it("increments moves on valid click", () => {
    const s = initialState(1, easy);
    const idx = Array.from({ length: s.puzzle.size ** 2 }, (_, i) => i)
      .find(i => !s.puzzle.clues.some(c => c.idx === i))!;
    const s2 = reducer(s, { type: "clickCell", idx });
    expect(s2.moves).toBe(1);
  });
});

describe("Yajilin reset", () => {
  it("clears all cells and resets moves", () => {
    const s = initialState(1, easy);
    const idx = Array.from({ length: s.puzzle.size ** 2 }, (_, i) => i)
      .find(i => !s.puzzle.clues.some(c => c.idx === i))!;
    const s2 = reducer(reducer(s, { type: "clickCell", idx }), { type: "reset" });
    expect(s2.cells.every(c => c === "empty")).toBe(true);
    expect(s2.moves).toBe(0);
    expect(s2.won).toBe(false);
  });
});

describe("Yajilin checkWon", () => {
  it("returns false for empty board", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const cells = new Array(36).fill("empty");
    expect(checkWon(puzzle, cells)).toBe(false);
  });

  it("returns true for correct solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const cells = new Array(36).fill("empty") as ("empty" | "loop" | "shaded")[];
    const clueSet = new Set(puzzle.clues.map(c => c.idx));
    for (let i = 0; i < 36; i++) {
      if (clueSet.has(i)) continue;
      if (puzzle.shadedSolution[i]) { cells[i] = "shaded"; continue; }
      if (puzzle.loopSolution.includes(i)) { cells[i] = "loop"; continue; }
    }
    expect(checkWon(puzzle, cells)).toBe(true);
  });
});

describe("Yajilin isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const result = isTerminal({ ...s, won: true, moves: 20 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(920);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});

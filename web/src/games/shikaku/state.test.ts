import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findClueInRect, draftToRect } from "./state.js";
import { SHIKAKU_PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Shikaku puzzles integrity", () => {
  it("every solution rect has the correct area matching its clue", () => {
    for (const puzzles of Object.values(SHIKAKU_PUZZLES)) {
      for (const puzzle of puzzles) {
        for (let i = 0; i < puzzle.clues.length; i++) {
          const rect = puzzle.solution[i]!;
          const clue = puzzle.clues[i]!;
          expect(rect.h * rect.w).toBe(clue.value);
        }
      }
    }
  });

  it("every clue is inside its solution rect", () => {
    for (const puzzles of Object.values(SHIKAKU_PUZZLES)) {
      for (const puzzle of puzzles) {
        for (let i = 0; i < puzzle.clues.length; i++) {
          const rect = puzzle.solution[i]!;
          const clue = puzzle.clues[i]!;
          expect(clue.r >= rect.r && clue.r < rect.r + rect.h).toBe(true);
          expect(clue.c >= rect.c && clue.c < rect.c + rect.w).toBe(true);
        }
      }
    }
  });

  it("solution rects tile the full grid", () => {
    for (const puzzles of Object.values(SHIKAKU_PUZZLES)) {
      for (const puzzle of puzzles) {
        const covered = new Array(puzzle.size ** 2).fill(0);
        for (const rect of puzzle.solution) {
          for (let r = rect.r; r < rect.r + rect.h; r++) {
            for (let c = rect.c; c < rect.c + rect.w; c++) {
              covered[r * puzzle.size + c]++;
            }
          }
        }
        expect(covered.every(n => n === 1)).toBe(true);
      }
    }
  });
});

describe("Shikaku initialState", () => {
  it("starts with no placed rects, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.placed.every(r => r === null)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Shikaku draftToRect", () => {
  it("normalises reversed drag direction", () => {
    const r = draftToRect({ r1: 3, c1: 4, r2: 1, c2: 2 });
    expect(r).toEqual({ r: 1, c: 2, h: 3, w: 3 });
  });
});

describe("Shikaku findClueInRect", () => {
  it("finds the clue inside a rect", () => {
    const easyPuzzles = SHIKAKU_PUZZLES["easy"]!;
    const puzzle = easyPuzzles[0]!;
    const idx = findClueInRect(puzzle, { r: 0, c: 0, h: 1, w: 6 });
    expect(idx).toBe(0); // first clue at (0,0)
  });

  it("returns -1 when no clue inside", () => {
    const easyPuzzles = SHIKAKU_PUZZLES["easy"]!;
    const puzzle = easyPuzzles[0]!;
    // No clue in rows 2-2, cols 1-2 (between strips in E1)
    const idx = findClueInRect(puzzle, { r: 2, c: 1, h: 1, w: 1 });
    expect(idx).toBe(-1);
  });
});

describe("Shikaku drag actions", () => {
  it("endDrag places rect when valid", () => {
    const s = initialState(1, easy);
    // Use the actual puzzle from this state — grab first solution rect
    const puzzle = s.puzzle;
    const rect = puzzle.solution[0]!;
    let s2 = reducer(s, { type: "startDrag", r: rect.r, c: rect.c });
    s2 = reducer(s2, { type: "updateDrag", r: rect.r + rect.h - 1, c: rect.c + rect.w - 1 });
    s2 = reducer(s2, { type: "endDrag" });
    expect(s2.placed[0]).not.toBeNull();
    expect(s2.moves).toBe(1);
  });

  it("endDrag discards rect when area doesn't match clue", () => {
    const s = initialState(1, easy);
    // Drag only 3 cells for first clue that needs 6
    let s2 = reducer(s, { type: "startDrag", r: 0, c: 0 });
    s2 = reducer(s2, { type: "updateDrag", r: 0, c: 2 });
    s2 = reducer(s2, { type: "endDrag" });
    expect(s2.placed[0]).toBeNull();
    expect(s2.moves).toBe(0);
  });
});

describe("Shikaku win", () => {
  it("wins when all rects are correctly placed", () => {
    let s = initialState(1, easy);
    // Force solve using solution rects
    const puzzle = s.puzzle;
    for (const [i, rect] of puzzle.solution.entries()) {
      s = reducer(s, { type: "startDrag", r: rect.r, c: rect.c });
      s = reducer(s, { type: "updateDrag", r: rect.r + rect.h - 1, c: rect.c + rect.w - 1 });
      s = reducer(s, { type: "endDrag" });
    }
    expect(s.won).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score >= 100 when won", () => {
    const s = initialState(1, easy);
    const result = isTerminal({ ...s, won: true, moves: 10 });
    expect(result!.score).toBe(950);
  });
});

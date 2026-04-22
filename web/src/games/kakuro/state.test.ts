import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES, computeRuns } from "./state.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };
const hard = { difficulty: "hard" as const };

describe("Kakuro initialState", () => {
  it("creates a board with correct number of cells", () => {
    const s = initialState(1, easy);
    expect(s.board.length).toBe(s.puzzle.rows * s.puzzle.cols);
  });

  it("starts with all zeros (empty), not won, no errors", () => {
    const s = initialState(42, easy);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
    expect(s.board.every((v) => v === 0)).toBe(true);
    expect(s.errorCells.size).toBe(0);
  });

  it("is deterministic for the same seed", () => {
    const s1 = initialState(99, medium);
    const s2 = initialState(99, medium);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("solution satisfies all run clues", () => {
    for (const diff of ["easy", "medium", "hard"] as const) {
      for (const puzzle of PUZZLES[diff]!) {
        const { acrossRuns, downRuns } = computeRuns(puzzle);
        for (const run of [...acrossRuns, ...downRuns]) {
          const sum = run.cells.reduce((a, i) => a + puzzle.solution[i]!, 0);
          expect(sum).toBe(run.clue);
          // no duplicates
          const digits = run.cells.map((i) => puzzle.solution[i]!);
          expect(new Set(digits).size).toBe(digits.length);
        }
      }
    }
  });
});

describe("Kakuro selectCell", () => {
  it("selects a white cell", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.cells.findIndex((c) => !c.isBlack);
    const s2 = reducer(s, { type: "selectCell", idx: whiteIdx });
    expect(s2.selected).toBe(whiteIdx);
  });

  it("ignores black cell selection", () => {
    const s = initialState(1, easy);
    const blackIdx = s.puzzle.cells.findIndex((c) => c.isBlack);
    const s2 = reducer(s, { type: "selectCell", idx: blackIdx });
    expect(s2.selected).toBeNull();
  });
});

describe("Kakuro enterDigit", () => {
  it("places a digit in the selected cell and increments moves", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.cells.findIndex((c) => !c.isBlack);
    let s2 = reducer(s, { type: "selectCell", idx: whiteIdx });
    s2 = reducer(s2, { type: "enterDigit", digit: 5 });
    expect(s2.board[whiteIdx]).toBe(5);
    expect(s2.moves).toBe(1);
  });

  it("no-op when no cell is selected", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "enterDigit", digit: 3 });
    expect(s2.moves).toBe(0);
  });

  it("detects error when digit repeats in a run", () => {
    const s = initialState(1, easy);
    const { acrossRuns } = computeRuns(s.puzzle);
    const run = acrossRuns[0]!;
    // Put same digit in two cells of the same run
    let st = reducer(s, { type: "selectCell", idx: run.cells[0]! });
    st = reducer(st, { type: "enterDigit", digit: 3 });
    st = reducer(st, { type: "selectCell", idx: run.cells[1]! });
    st = reducer(st, { type: "enterDigit", digit: 3 });
    expect(st.errorCells.size).toBeGreaterThan(0);
  });
});

describe("Kakuro clearCell", () => {
  it("clears the selected cell", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.cells.findIndex((c) => !c.isBlack);
    let s2 = reducer(s, { type: "selectCell", idx: whiteIdx });
    s2 = reducer(s2, { type: "enterDigit", digit: 7 });
    expect(s2.board[whiteIdx]).toBe(7);
    s2 = reducer(s2, { type: "clearCell" });
    expect(s2.board[whiteIdx]).toBe(0);
  });
});

describe("Kakuro win condition", () => {
  it("wins when all white cells match the solution", () => {
    const puzzle = PUZZLES["easy"]![0]!;
    const s = initialState(0, easy);
    // manually force a state where board = solution
    const wonState = {
      ...s,
      puzzle,
      board: puzzle.solution.slice(),
      won: false,
    };
    // trigger a clearCell on a non-selected to recompute — actually fill last white
    const whiteIdxs = puzzle.cells.map((c, i) => (!c.isBlack ? i : -1)).filter((i) => i >= 0);
    let st = { ...wonState, board: puzzle.solution.slice(), selected: whiteIdxs[0] ?? null };
    // Re-enter the solution digit for the first white cell to trigger win check
    const solDigit = puzzle.solution[whiteIdxs[0]!]!;
    const almostBoard = puzzle.solution.slice();
    almostBoard[whiteIdxs[0]!] = 0;
    st = { ...st, board: almostBoard };
    st = reducer(st, { type: "enterDigit", digit: solDigit });
    expect(st.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 20 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 1000 - 20 * 5));
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(1, easy);
    expect(isTerminal(s)).toBeNull();
  });
});

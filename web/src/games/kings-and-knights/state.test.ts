import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeConflicts, allPieces, attacks } from "./state.js";
import { kingAttacks, knightAttacks } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Kings and Knights attacks", () => {
  it("king attacks adjacent cell", () => {
    expect(kingAttacks(0, 0, 1, 1)).toBe(true);
    expect(kingAttacks(0, 0, 0, 1)).toBe(true);
    expect(kingAttacks(0, 0, 2, 0)).toBe(false);
  });

  it("knight attacks L-shapes", () => {
    expect(knightAttacks(0, 0, 2, 1)).toBe(true);
    expect(knightAttacks(0, 0, 1, 2)).toBe(true);
    expect(knightAttacks(0, 0, 1, 1)).toBe(false);
    expect(knightAttacks(0, 0, 3, 0)).toBe(false);
  });

  it("pieces attack each other symmetrically", () => {
    const k = { row: 0, col: 0, type: "K" as const };
    const n = { row: 1, col: 1, type: "N" as const };
    expect(attacks(k, n)).toBe(attacks(n, k));
  });
});

describe("Kings and Knights initialState", () => {
  it("starts with no placed pieces and not won", () => {
    const s = initialState(1, easy);
    expect(s.placed).toHaveLength(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("medium uses 8×8 board", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.size).toBe(8);
  });

  it("easy uses 6×6 board", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.size).toBe(6);
  });
});

describe("Kings and Knights reducer", () => {
  it("toggleCell places a piece", () => {
    const s = initialState(1, easy);
    const clueRows = new Set(s.puzzle.clues.map(p => `${p.row},${p.col}`));
    // find a non-clue cell
    let row = 5, col = 5;
    const s2 = reducer(s, { type: "toggleCell", row, col });
    if (!clueRows.has(`${row},${col}`)) {
      expect(allPieces(s2).some(p => p.row === row && p.col === col)).toBe(true);
      expect(s2.moves).toBe(1);
    }
  });

  it("cannot modify clue cells", () => {
    const s = initialState(1, easy);
    const clue = s.puzzle.clues[0]!;
    const s2 = reducer(s, { type: "toggleCell", row: clue.row, col: clue.col });
    expect(s2.placed).toHaveLength(0);
  });

  it("selectType changes selected piece type", () => {
    const s = initialState(1, easy);
    expect(s.selectedType).toBe("K");
    const s2 = reducer(s, { type: "selectType", pieceType: "N" });
    expect(s2.selectedType).toBe("N");
  });

  it("reset clears placed pieces", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleCell", row: 5, col: 5 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.placed).toHaveLength(0);
    expect(s3.moves).toBe(0);
  });
});

describe("Kings and Knights checkWon", () => {
  it("returns false when too few pieces", () => {
    const s = initialState(1, easy);
    expect(checkWon(s)).toBe(false);
  });

  it("solution pieces have no conflicts", () => {
    for (const puzzle of [initialState(1, easy).puzzle, initialState(2, easy).puzzle]) {
      const conflicts = computeConflicts(puzzle.solution);
      expect(conflicts.size).toBe(0);
    }
  });
});

describe("Kings and Knights isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 10 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});

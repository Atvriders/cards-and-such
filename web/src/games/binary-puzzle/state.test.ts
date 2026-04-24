import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BinaryPuzzleState } from "./state.js";

describe("BinaryPuzzle initialState", () => {
  it("creates 6x6 grid", () => {
    const s = initialState(1, { size: 6 });
    expect(s.size).toBe(6);
    expect(s.board.length).toBe(36);
    expect(s.solution.length).toBe(36);
  });

  it("creates 8x8 grid", () => {
    const s = initialState(1, { size: 8 });
    expect(s.size).toBe(8);
    expect(s.board.length).toBe(64);
  });

  it("solution has equal 0s and 1s per row", () => {
    const s = initialState(42, { size: 6 });
    for (let r = 0; r < 6; r++) {
      const row = Array.from({ length: 6 }, (_, c) => s.solution[r * 6 + c]);
      const zeros = row.filter((v) => v === 0).length;
      const ones = row.filter((v) => v === 1).length;
      expect(zeros).toBe(3);
      expect(ones).toBe(3);
    }
  });

  it("solution has no three-in-a-row", () => {
    const s = initialState(42, { size: 6 });
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const a = s.solution[r * 6 + c];
        const b = s.solution[r * 6 + c + 1];
        const cc = s.solution[r * 6 + c + 2];
        expect(a === b && b === cc).toBe(false);
      }
    }
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, { size: 6 });
    const s2 = initialState(7, { size: 6 });
    expect(Array.from(s1.solution)).toEqual(Array.from(s2.solution));
  });
});

describe("BinaryPuzzle reducer", () => {
  it("set places a value in empty cell", () => {
    const s = initialState(1, { size: 6 });
    const emptyIdx = s.board.findIndex((v) => v === null);
    const s2 = reducer(s, { type: "set", index: emptyIdx, value: 1 });
    expect(s2.board[emptyIdx]).toBe(1);
    expect(s2.movesMade).toBe(1);
  });

  it("cannot modify clue cells", () => {
    const s = initialState(1, { size: 6 });
    const clueIdx = s.clues.findIndex(Boolean);
    const clueValue = s.board[clueIdx];
    const s2 = reducer(s, { type: "set", index: clueIdx, value: (1 - (clueValue as number)) as 0 | 1 });
    expect(s2.board[clueIdx]).toBe(clueValue);
  });

  it("set null clears a cell", () => {
    const s = initialState(1, { size: 6 });
    const emptyIdx = s.board.findIndex((v) => v === null);
    const s2 = reducer(s, { type: "set", index: emptyIdx, value: 0 });
    const s3 = reducer(s2, { type: "set", index: emptyIdx, value: null });
    expect(s3.board[emptyIdx]).toBeNull();
  });

  it("no-op when won", () => {
    const s = initialState(1, { size: 6 });
    const won: BinaryPuzzleState = { ...s, won: true };
    const emptyIdx = won.board.findIndex((v) => v === null);
    if (emptyIdx !== -1) {
      const s2 = reducer(won, { type: "set", index: emptyIdx, value: 1 });
      expect(s2.movesMade).toBe(0);
    }
  });
});

describe("BinaryPuzzle isTerminal", () => {
  it("returns null when not solved", () => {
    expect(isTerminal(initialState(1, { size: 6 }))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { size: 6 });
    const won: BinaryPuzzleState = { ...s, won: true, movesMade: 10 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });

  it("score floors at 100", () => {
    const s = initialState(1, { size: 6 });
    const won: BinaryPuzzleState = { ...s, won: true, movesMade: 9999 };
    expect(isTerminal(won)!.score).toBe(100);
  });
});

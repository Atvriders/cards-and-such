import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, minMoves } from "./state.js";
import type { TowerOfHanoiState } from "./state.js";

const s3 = { disks: "3" as const };
const s5 = { disks: "5" as const };

describe("TowerOfHanoi initialState", () => {
  it("all disks on peg 0, sorted largest first (index 0=bottom)", () => {
    const s = initialState(1, s3);
    expect(s.pegs[0]).toEqual([3, 2, 1]);
    expect(s.pegs[1]).toEqual([]);
    expect(s.pegs[2]).toEqual([]);
  });

  it("numDisks matches setting", () => {
    expect(initialState(1, s3).numDisks).toBe(3);
    expect(initialState(1, s5).numDisks).toBe(5);
  });

  it("initial moves and hints are 0", () => {
    const s = initialState(1, s3);
    expect(s.moves).toBe(0);
    expect(s.hints).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("TowerOfHanoi select / move", () => {
  it("selecting empty peg is no-op", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "select", peg: 1 }); // empty
    expect(s2.selectedPeg).toBeNull();
  });

  it("first select sets selectedPeg", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "select", peg: 0 });
    expect(s2.selectedPeg).toBe(0);
  });

  it("second click same peg deselects", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "select", peg: 0 });
    const s3_ = reducer(s2, { type: "select", peg: 0 });
    expect(s3_.selectedPeg).toBeNull();
  });

  it("valid move (smallest to empty peg) executes correctly", () => {
    const s = initialState(1, s3);
    // Move disk 1 from peg 0 to peg 2
    let cur = reducer(s, { type: "select", peg: 0 });
    cur = reducer(cur, { type: "select", peg: 2 });
    expect(cur.pegs[0]).toEqual([3, 2]);
    expect(cur.pegs[2]).toEqual([1]);
    expect(cur.moves).toBe(1);
  });

  it("invalid move (larger on smaller) is rejected", () => {
    const s = initialState(1, s3);
    // Move disk 1 to peg 2, then try to move disk 2 onto disk 1
    let cur = reducer(s, { type: "select", peg: 0 });
    cur = reducer(cur, { type: "select", peg: 2 }); // disk 1 to peg 2
    cur = reducer(cur, { type: "select", peg: 0 }); // select peg 0 (disk 2 on top)
    const before = cur.moves;
    cur = reducer(cur, { type: "select", peg: 2 }); // try to place disk 2 on disk 1 - invalid
    expect(cur.moves).toBe(before);
    expect(cur.pegs[2]).toEqual([1]); // unchanged
  });
});

describe("TowerOfHanoi win condition", () => {
  it("wins when all disks on peg 2", () => {
    // Solve 3-disk manually with optimal moves
    const s = initialState(1, s3);
    const moves: [number, number][] = [
      [0, 2], [0, 1], [2, 1], [0, 2], [1, 0], [1, 2], [0, 2],
    ];
    let cur = s;
    for (const [from, to] of moves) {
      cur = reducer(cur, { type: "select", peg: from });
      cur = reducer(cur, { type: "select", peg: to });
    }
    expect(cur.won).toBe(true);
    expect(cur.pegs[2]).toEqual([3, 2, 1]);
  });
});

describe("TowerOfHanoi hint", () => {
  it("hint makes a valid move and increments hints counter", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "hint" });
    expect(s2.hints).toBe(1);
    expect(s2.moves).toBe(1);
    // Hint should never leave an invalid state
    for (const peg of s2.pegs) {
      for (let i = 1; i < peg.length; i++) {
        expect(peg[i]!).toBeLessThan(peg[i - 1]!);
      }
    }
  });

  it("hints can solve the puzzle step by step", () => {
    const s = initialState(1, s3);
    const minM = minMoves(3); // 7
    let cur = s;
    for (let i = 0; i < minM; i++) {
      cur = reducer(cur, { type: "hint" });
    }
    expect(cur.won).toBe(true);
  });
});

describe("TowerOfHanoi isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, s3);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s: TowerOfHanoiState = {
      ...initialState(1, s3),
      won: true,
      moves: 7,
      hints: 0,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(50, 1000 - 7 * 10));
  });

  it("hints reduce score", () => {
    const s1: TowerOfHanoiState = { ...initialState(1, s3), won: true, moves: 7, hints: 0 };
    const s2: TowerOfHanoiState = { ...initialState(1, s3), won: true, moves: 7, hints: 2 };
    expect(isTerminal(s1)!.score).toBeGreaterThan(isTerminal(s2)!.score);
  });

  it("minMoves formula: 2^N - 1", () => {
    expect(minMoves(3)).toBe(7);
    expect(minMoves(5)).toBe(31);
    expect(minMoves(7)).toBe(127);
  });
});

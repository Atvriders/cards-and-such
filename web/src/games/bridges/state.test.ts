import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, islandBridgeCount } from "./state.js";
import type { Bridge } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("Bridges initialState", () => {
  it("starts with no bridges, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.bridges).toHaveLength(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("different seeds may produce different puzzles", () => {
    const s1 = initialState(1, easy);
    const s2 = initialState(99999, easy);
    // Just check they are valid
    expect(s1.puzzle.size).toBeGreaterThan(0);
    expect(s2.puzzle.size).toBeGreaterThan(0);
  });
});

describe("Bridges addBridge action", () => {
  it("adds a bridge between two islands", () => {
    const s = initialState(1, easy);
    // puzzle has island at (0,0)=2 and (0,3)=3
    const s2 = reducer(s, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    expect(s2.bridges.length).toBeGreaterThan(0);
    expect(s2.moves).toBe(1);
  });

  it("upgrades single bridge to double on second click", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const s3 = reducer(s2, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const bridge = s3.bridges.find(b =>
      (b.r1 === 0 && b.c1 === 0 && b.r2 === 0 && b.c2 === 3) ||
      (b.r1 === 0 && b.c1 === 3 && b.r2 === 0 && b.c2 === 0)
    );
    expect(bridge?.count).toBe(2);
  });

  it("removes bridge on third click (cycling)", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const s3 = reducer(s2, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const s4 = reducer(s3, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const bridge = s4.bridges.find(b =>
      (b.r1 === 0 && b.c1 === 0 && b.r2 === 0 && b.c2 === 3) ||
      (b.r1 === 0 && b.c1 === 3 && b.r2 === 0 && b.c2 === 0)
    );
    expect(bridge).toBeUndefined();
  });
});

describe("Bridges islandBridgeCount", () => {
  it("counts bridges touching an island", () => {
    const bridges: Bridge[] = [
      { r1: 0, c1: 0, r2: 0, c2: 3, count: 2 },
      { r1: 0, c1: 0, r2: 2, c2: 0, count: 1 },
    ];
    expect(islandBridgeCount(bridges, 0, 0)).toBe(3);
    expect(islandBridgeCount(bridges, 0, 3)).toBe(2);
    expect(islandBridgeCount(bridges, 2, 0)).toBe(1);
  });
});

describe("Bridges checkWon", () => {
  it("returns false for empty bridges", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, [])).toBe(false);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 15 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(925);
  });

  it("score floor at 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});

describe("Bridges reset", () => {
  it("clears bridges and moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "addBridge", r1: 0, c1: 0, r2: 0, c2: 3 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.bridges).toHaveLength(0);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});

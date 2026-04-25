import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ForestTrekSettings } from "./state.js";

const s5: ForestTrekSettings = { size: "5" };
const s6: ForestTrekSettings = { size: "6" };

describe("ForestTrek initialState", () => {
  it("grid has correct size for 5x5", () => {
    expect(initialState(1, s5).grid).toHaveLength(25);
  });

  it("grid has correct size for 6x6", () => {
    expect(initialState(1, s6).grid).toHaveLength(36);
  });

  it("starts at position 0", () => {
    expect(initialState(1, s5).playerPos).toBe(0);
  });

  it("starts with 0 moves and not won", () => {
    const s = initialState(1, s5);
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });

  it("first cell is start type", () => {
    const s = initialState(1, s5);
    expect(s.grid[0]!.type).toBe("start");
  });

  it("last cell is end type", () => {
    const s = initialState(1, s5);
    expect(s.grid[24]!.type).toBe("end");
  });
});

describe("ForestTrek reducer", () => {
  it("cannot move out of bounds up from top row", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerPos).toBe(0);
  });

  it("cannot move out of bounds left from col 0", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "move", dir: "left" });
    expect(s2.playerPos).toBe(0);
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "move", dir: "down" });
    s = reducer(s, { type: "restart" });
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("ForestTrek isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, s5), won: true, gameOver: true, moves: 8 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("fewer moves gives higher score", () => {
    const base = initialState(1, s5);
    const s1 = { ...base, won: true, gameOver: true, moves: 8 };
    const s2 = { ...base, won: true, gameOver: true, moves: 20 };
    expect(isTerminal(s1)!.score).toBeGreaterThan(isTerminal(s2)!.score);
  });
});

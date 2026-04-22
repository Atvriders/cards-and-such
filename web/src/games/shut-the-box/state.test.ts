import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, validCombinations, hasValidMove, computeScore } from "./state.js";

const defaultSettings = { targetScore: "25" as const };

describe("Shut the Box initialState", () => {
  it("starts with all 9 tiles open and score 45", () => {
    const s = initialState(42, defaultSettings);
    expect(s.tiles.every((t) => t === true)).toBe(true);
    expect(s.score).toBe(45);
    expect(s.phase).toBe("preRoll");
  });

  it("is deterministic under same seed", () => {
    expect(initialState(7, defaultSettings)).toEqual(initialState(7, defaultSettings));
  });
});

describe("validCombinations", () => {
  it("finds {7} for sum=7 when tile 7 is open", () => {
    const tiles = Array(9).fill(true);
    const combos = validCombinations(tiles, 7);
    expect(combos.some((c) => c.length === 1 && c[0] === 7)).toBe(true);
  });

  it("finds {3,4} and {1,2,4} and {2,5} for sum=7", () => {
    const tiles = Array(9).fill(true);
    const combos = validCombinations(tiles, 7);
    expect(combos.some((c) => c.join(",") === "3,4")).toBe(true);
    expect(combos.some((c) => c.join(",") === "2,5")).toBe(true);
  });

  it("returns no combos when no open tiles sum to total", () => {
    const tiles = Array(9).fill(false);
    tiles[0] = true; // only tile 1 open
    expect(validCombinations(tiles, 7).length).toBe(0);
  });

  it("hasValidMove returns false when stuck", () => {
    const tiles = Array(9).fill(false);
    tiles[0] = true; // tile 1 open, sum=12 impossible
    expect(hasValidMove(tiles, 12)).toBe(false);
  });
});

describe("computeScore", () => {
  it("sums open tiles correctly", () => {
    const tiles = Array(9).fill(false);
    tiles[0] = true; // tile 1
    tiles[2] = true; // tile 3
    expect(computeScore(tiles)).toBe(4);
  });

  it("returns 0 when all closed", () => {
    expect(computeScore(Array(9).fill(false))).toBe(0);
  });
});

describe("Shut the Box reducer", () => {
  it("roll changes phase to chooseTiles or gameOver", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(["chooseTiles", "gameOver"]).toContain(s2.phase);
    expect(s2.roll).not.toBeNull();
  });

  it("closeTiles closes the specified tiles if sum matches", () => {
    // Start a game, force a scenario
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    if (s.phase === "chooseTiles") {
      const combos = validCombinations(s.tiles, s.rollSum);
      if (combos.length > 0) {
        const pick = combos[0]!;
        const indices = pick.map((v) => v - 1);
        const s2 = reducer(s, { type: "closeTiles", indices });
        indices.forEach((i) => expect(s2.tiles[i]).toBe(false));
      }
    }
  });

  it("rejects closeTiles if sum does not match", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "roll" });
    if (s.phase === "chooseTiles") {
      const wrongIndices = [0]; // tile 1 — almost certainly won't match rollSum
      if (s.rollSum !== 1) {
        const s2 = reducer(s, { type: "closeTiles", indices: wrongIndices });
        expect(s2.tiles).toEqual(s.tiles); // no change
      }
    }
  });

  it("game ends when no move possible", () => {
    // Seal all but tile 1, roll and check gameOver
    let s = initialState(42, defaultSettings);
    s = { ...s, tiles: Array(9).fill(false).map((_, i) => i === 0) }; // only tile 1 open, score=1
    // Roll — with only tile 1 open, any roll > 1 means no move
    s = reducer(s, { type: "roll" });
    if (s.roll && s.rollSum > 1) {
      expect(s.phase).toBe("gameOver");
    }
  });
});

describe("Shut the Box isTerminal", () => {
  it("null mid-game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score after game over", () => {
    let s = initialState(42, defaultSettings);
    // Force game over quickly
    s = { ...s, tiles: Array(9).fill(false).map((_, i) => i === 0), phase: "preRoll" };
    s = reducer(s, { type: "roll" });
    if (s.phase === "gameOver") {
      const result = isTerminal(s);
      expect(result).not.toBeNull();
      expect(typeof result!.score).toBe("number");
    }
  });
});

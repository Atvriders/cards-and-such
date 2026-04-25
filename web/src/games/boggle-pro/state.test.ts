import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, scoreWord, isValidWord, MAX_TURNS, GRID_SIZE } from "./state.js";

describe("Boggle Pro", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.grid.length).toBe(GRID_SIZE * GRID_SIZE);
    expect(s.foundWords.length).toBe(0);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("play");
  });

  it("scoreWord gives correct points", () => {
    expect(scoreWord("cat")).toBe(1);
    expect(scoreWord("bark")).toBe(2);
    expect(scoreWord("crane")).toBe(4);
    expect(scoreWord("bridge")).toBe(6);
    expect(scoreWord("bridges")).toBe(10);
  });

  it("submitting a duplicate word scores 0", () => {
    const s = initialState(42);
    // Override grid to contain the letters for "at" - just set foundWords
    const s2 = { ...s, foundWords: ["cat"] };
    // "cat" already found, submitting again should not score
    const s3 = reducer(s2, { type: "submitWord", word: "cat" });
    expect(s3.score).toBe(0);
    expect(s3.lastValid).toBe(false);
  });

  it("passing increments turn count", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.turns).toBe(1);
    expect(s2.phase).toBe("play");
  });

  it("endGame triggers done phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endGame" });
    expect(s2.phase).toBe("done");
    expect(isTerminal(s2)).not.toBeNull();
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("game ends after MAX_TURNS passes", () => {
    let s = initialState(42);
    for (let i = 0; i < MAX_TURNS; i++) {
      s = reducer(s, { type: "pass" });
    }
    expect(s.phase).toBe("done");
  });

  it("isValidWord rejects words not in grid letters", () => {
    const grid = Array(16).fill("A"); // all A's
    const found: string[] = [];
    // "bat" needs B, not present
    expect(isValidWord("bat", grid, found)).toBe(false);
  });
});

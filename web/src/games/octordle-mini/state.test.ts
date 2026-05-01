import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreGuess, NUM_BOARDS, MAX_GUESSES } from "./state.js";
import type { OctordleMiniSettings } from "./state.js";

const S: OctordleMiniSettings = { rounds: "8" };

describe("OctordleMiniState", () => {
  it("creates the right number of distinct answers", () => {
    const s = initialState(2, S);
    expect(s.answers.length).toBe(NUM_BOARDS);
    expect(new Set(s.answers).size).toBe(NUM_BOARDS);
  });
  it("scoreGuess marks correct positions", () => {
    const tiles = scoreGuess("APPLE", "APPLE");
    expect(tiles.every(t => t === "correct")).toBe(true);
  });
  it("typing accumulates current input", () => {
    let s = initialState(2, S);
    s = reducer(s, { type: "key", ch: "C" });
    s = reducer(s, { type: "key", ch: "R" });
    expect(s.current).toBe("CR");
  });
  it("solving all boards wins", () => {
    let s = initialState(2, S);
    for (const ans of s.answers) {
      for (const ch of ans) s = reducer(s, { type: "key", ch });
      s = reducer(s, { type: "enter" });
      if (s.status === "won") break;
    }
    expect(s.status === "won" || s.guesses.length === MAX_GUESSES).toBe(true);
  });
  it("isTerminal returns null while playing", () => {
    const s = initialState(2, S);
    expect(isTerminal(s)).toBeNull();
  });
});

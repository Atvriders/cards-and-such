import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreGuess, NUM_BOARDS } from "./state.js";
import type { DordleMiniSettings } from "./state.js";

const S: DordleMiniSettings = { rounds: "8" };

describe("dordle-mini", () => {
  it("creates two distinct answers", () => {
    const s = initialState(2, S);
    expect(s.answers.length).toBe(NUM_BOARDS);
    expect(s.answers[0]).not.toBe(s.answers[1]);
  });
  it("scoreGuess marks correct positions", () => {
    const tiles = scoreGuess("APPLE", "APPLE");
    expect(tiles.every(t => t === "correct")).toBe(true);
  });
  it("solving both boards wins", () => {
    let s = initialState(3, S);
    for (const ch of s.answers[0]!) s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.solved[0]).toBe(true);
    expect(s.status).toBe("playing");
    for (const ch of s.answers[1]!) s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.status).toBe("won");
  });
  it("rejects invalid words", () => {
    let s = initialState(1, S);
    for (const ch of "ZZZZZ") s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.guesses.length).toBe(0);
  });
  it("isTerminal returns score on win", () => {
    let s = initialState(4, S);
    for (const a of s.answers) {
      for (const ch of a) s = reducer(s, { type: "key", ch });
      s = reducer(s, { type: "enter" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});

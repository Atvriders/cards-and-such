import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreGuess, adversarialResponse } from "./state.js";
import type { AbsurdleMiniSettings } from "./state.js";

const S: AbsurdleMiniSettings = { rounds: "8" };

describe("absurdle-mini", () => {
  it("starts with full candidate pool", () => {
    const s = initialState(1, S);
    expect(s.candidates.length).toBeGreaterThan(20);
    expect(s.status).toBe("playing");
  });
  it("scoreGuess identifies greens", () => {
    expect(scoreGuess("APPLE", "APPLE").every(t => t === "correct")).toBe(true);
  });
  it("adversarialResponse shrinks candidates", () => {
    const s = initialState(2, S);
    const { remaining } = adversarialResponse("CRANE", s.candidates);
    expect(remaining.length).toBeLessThanOrEqual(s.candidates.length);
    expect(remaining.length).toBeGreaterThan(0);
  });
  it("typing accumulates current input", () => {
    let s = initialState(2, S);
    for (const ch of "CRANE") s = reducer(s, { type: "key", ch });
    expect(s.current).toBe("CRANE");
  });
  it("rejects invalid words", () => {
    let s = initialState(2, S);
    for (const ch of "ZZZZZ") s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.guesses.length).toBe(0);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});

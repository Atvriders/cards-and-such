import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WorldleCountrySettings } from "./state.js";

const S: WorldleCountrySettings = { rounds: "5" };

describe("worldle-country", () => {
  it("starts in playing status with empty guesses", () => {
    const s = initialState(1, S);
    expect(s.status).toBe("playing");
    expect(s.guesses.length).toBe(0);
    expect(s.maxGuesses).toBe(5);
  });
  it("isTerminal is null while playing", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });
  it("typing letters builds the current guess", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "key", ch: "f" });
    s = reducer(s, { type: "key", ch: "r" });
    expect(s.current).toBe("FR");
  });
  it("entering wrong country adds a guess", () => {
    let s = initialState(1, S);
    const wrong = s.answer.name === "FRANCE" ? "GERMANY" : "FRANCE";
    for (const ch of wrong) s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.guesses.length).toBe(1);
    expect(s.current).toBe("");
  });
  it("entering the correct country wins", () => {
    let s = initialState(1, S);
    for (const ch of s.answer.name) s = reducer(s, { type: "key", ch });
    s = reducer(s, { type: "enter" });
    expect(s.status).toBe("won");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});

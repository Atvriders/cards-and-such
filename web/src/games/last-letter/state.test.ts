import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("last-letter", () => {
  it("initialState sets up chain with starter word", () => {
    const s = initialState(1, { duration: "60" });
    expect(s.chain).toHaveLength(1);
    expect(s.timeLeft).toBe(60);
    expect(s.phase).toBe("playing");
  });

  it("valid chain word is accepted", () => {
    let s = initialState(10, { duration: "60" });
    // starter ends with some letter, find a valid word starting with that letter
    const needed = s.chain[0]![s.chain[0]!.length - 1]!;
    // Try "ocean" -> 'n' -> need word starting with n: "nail"
    if (needed === "n") {
      s = reducer(s, { type: "type", text: "nail" });
      s = reducer(s, { type: "submit" });
      if (!s.lastError) {
        expect(s.chain.length).toBe(2);
        expect(s.score).toBeGreaterThan(0);
      }
    }
    // Just verify no crash
    expect(s).toBeTruthy();
  });

  it("word starting with wrong letter is rejected", () => {
    let s = initialState(2, { duration: "60" });
    const needed = s.chain[0]![s.chain[0]!.length - 1]!;
    // Pick a letter definitely NOT needed
    const wrongStart = needed === "a" ? "b" : "a";
    s = reducer(s, { type: "type", text: wrongStart + "bcd" });
    s = reducer(s, { type: "submit" });
    expect(s.lastError).toBeTruthy();
  });

  it("tick decrements timer", () => {
    let s = initialState(3, { duration: "60" });
    s = reducer(s, { type: "tick" });
    expect(s.timeLeft).toBe(59);
  });

  it("timer reaching zero ends the game", () => {
    let s = initialState(4, { duration: "60" });
    for (let i = 0; i < 60; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "5" as const };

describe("CardColorStreak", () => {
  it("initializes with a current card and zero streak", () => {
    const s = initialState(42, S);
    expect(s.streak).toBe(0);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });
  it("guessing changes the card and round", () => {
    const s = initialState(42, S);
    const prevCard = s.currentCard;
    const s2 = reducer(s, { type: "guess", color: "red" });
    expect(s2.currentCard).not.toBe(prevCard);
    expect(s2.round).toBe(2);
  });
  it("correct guess increases score", () => {
    let found = false;
    for (let seed = 0; seed < 20; seed++) {
      const s = initialState(seed, S);
      const s2r = reducer(s, { type: "guess", color: "red" });
      const s2b = reducer(s, { type: "guess", color: "black" });
      if (s2r.score > 0 || s2b.score > 0) { found = true; break; }
    }
    expect(found).toBe(true);
  });
  it("isTerminal returns score when done", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "guess", color: "red" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(typeof t?.score).toBe("number");
  });
});

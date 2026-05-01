import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-laboratory", () => {
  it("starts with a formula", () => {
    const s = initialState(1, S);
    expect(s.formula.length).toBe(3);
    s.formula.forEach(f => { expect(f).toBeGreaterThanOrEqual(1); expect(f).toBeLessThanOrEqual(6); });
  });
  it("mix produces 3 sorted dice", () => {
    const s = reducer(initialState(2, S), { type: "mix" });
    expect(s.rolls.length).toBe(3);
    for (let i = 1; i < s.rolls.length; i++) expect(s.rolls[i]).toBeGreaterThanOrEqual(s.rolls[i-1]!);
  });
  it("matched count is between 0 and 3", () => {
    const s = reducer(initialState(3, S), { type: "mix" });
    expect(s.matched).toBeGreaterThanOrEqual(0);
    expect(s.matched).toBeLessThanOrEqual(3);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after ROUNDS rounds", () => {
    let s = initialState(5, S);
    for (let i = 0; i < ROUNDS; i++) {
      s = reducer(s, { type: "mix" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

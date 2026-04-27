import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, scoreRound } from "./state.js";
const S = { dummy: false };
describe("DiceKing", () => {
  it("starts at round 1", () => { expect(initialState(1, S).round).toBe(1); });
  it("roll yields 3 dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice.length).toBe(3);
  });
  it("score grows", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.score).toBeGreaterThanOrEqual(3);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("scoreRound: triple-six = 18 + 20 = 38", () => {
    expect(scoreRound([6,6,6])).toBe(38);
    expect(scoreRound([5,5,3])).toBe(18); // pair: 13 + 5
    expect(scoreRound([1,3,5])).toBe(9);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, scoreRound } from "./state.js";
const S = { dummy: false };
describe("BuncoMini", () => {
  it("starts at round 1", () => { expect(initialState(1, S).round).toBe(1); });
  it("roll yields 3 dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice.length).toBe(3);
  });
  it("score is non-negative", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.score).toBeGreaterThanOrEqual(0);
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
  it("scoreRound: triple target = bunco 21", () => {
    expect(scoreRound([3,3,3], 3)).toEqual({ pts: 21, bunco: true });
    expect(scoreRound([2,2,2], 3)).toEqual({ pts: 5, bunco: false });
    expect(scoreRound([3,3,1], 3)).toEqual({ pts: 2, bunco: false });
    expect(scoreRound([1,2,4], 3)).toEqual({ pts: 0, bunco: false });
  });
});

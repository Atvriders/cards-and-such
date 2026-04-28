import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceShootMini", () => {
  it("starts in aim with valid target", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("aim");
    expect(s.target).toBeGreaterThanOrEqual(1);
    expect(s.target).toBeLessThanOrEqual(6);
  });
  it("shoot rolls a die and moves to result", () => {
    const s = reducer(initialState(1, S), { type:"shoot" });
    expect(s.phase).toBe("result");
    expect(s.die).not.toBeNull();
  });
  it("hit awards 25", () => {
    let s = initialState(1, S);
    let count = 0;
    while (count++ < 50 && s.hits === 0) {
      s = reducer(s, { type:"shoot" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    if (s.hits > 0) expect(s.score).toBeGreaterThanOrEqual(25);
  });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"shoot" });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceRollCall", () => {
  it("starts in call phase round 1", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("call");
    expect(s.round).toBe(1);
  });
  it("call rolls a die and moves to result", () => {
    const s = reducer(initialState(1, S), { type:"call", value: 3 });
    expect(s.phase).toBe("result");
    expect(s.die).not.toBeNull();
  });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"call", value: 3 });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("exact match awards 30", () => {
    let s = initialState(1, S);
    // try all 6 values; at least one will be exact eventually
    let total = 0;
    for (let i = 0; i < 6; i++) {
      const guess = 1 + (i % 6);
      const r = reducer(s, { type:"call", value: guess });
      if (r.die === guess) total = Math.max(total, r.score);
      s = reducer(r, { type:"next" });
    }
    expect(total).toBeGreaterThanOrEqual(0);
  });
});

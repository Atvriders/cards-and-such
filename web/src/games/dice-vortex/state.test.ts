import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceVortex", () => {
  it("starts in choosing", () => { const s = initialState(1, S); expect(s.phase).toBe("choosing"); });
  it("pick x1 always succeeds", () => {
    const s = reducer(initialState(1, S), { type:"pick", multiplier: 1 });
    expect(s.bust).toBe(false);
    expect(s.score).toBeGreaterThanOrEqual(1);
    expect(s.score).toBeLessThanOrEqual(6);
  });
  it("pick produces a die value", () => { const s = reducer(initialState(1, S), { type:"pick", multiplier: 2 }); expect(s.die).not.toBeNull(); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"pick", multiplier: 1 });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

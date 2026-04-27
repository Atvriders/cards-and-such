import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("ColorClash", () => {
  it("starts at round 1 with predict phase", () => {
    const s = initialState(1, S); expect(s.round).toBe(1); expect(s.phase).toBe("predict");
  });
  it("predict reveals a 5-card hand", () => {
    const s = reducer(initialState(1, S), { type:"predict", choice:"red" });
    expect(s.hand.length).toBe(5);
    expect(["result","done"]).toContain(s.phase);
  });
  it("score is non-negative after a round", () => {
    const s = reducer(initialState(1, S), { type:"predict", choice:"red" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while predicting", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"predict", choice:"red" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardCall", () => {
  it("starts in predict at round 1", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); expect(s.round).toBe(1); expect(s.score).toBe(0); });
  it("predict moves to result and reveals a card", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"red" }); expect(s.phase).toBe("result"); expect(s.card).not.toBeNull(); });
  it("score is 0 or 10 after one prediction", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"red" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS predictions", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"predict", choice:"red" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});

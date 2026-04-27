import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("PipPulse", () => {
  it("starts in predict", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict produces card and result", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"high" }); expect(s.card).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0 or 10", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"low" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"predict", choice:"low" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

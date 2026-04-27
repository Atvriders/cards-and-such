import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CutTheDeck", () => {
  it("starts in predict", () => { const s = initialState(1, S); expect(s.phase).toBe("predict"); });
  it("predict produces card and result/done", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"over" }); expect(s.card).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score 0 or 10 after one round", () => { const s = reducer(initialState(1, S), { type:"predict", choice:"over" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"predict", choice:"over" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

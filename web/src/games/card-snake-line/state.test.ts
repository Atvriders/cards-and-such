import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardSnakeLine", () => {
  it("starts in draw phase", () => { const s = initialState(1, S); expect(s.phase).toBe("draw"); expect(s.score).toBe(0); });
  it("draw produces a card", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.card).not.toBeNull(); });
  it("score is non-negative", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after total rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"draw" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

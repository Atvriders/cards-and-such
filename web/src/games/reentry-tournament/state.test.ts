import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, CARDS_PER_HAND } from "./state.js";
const S = { dummy: false };
describe("Re-Entry Tournament Solo", () => {
  it("starts in deal phase", () => { expect(initialState(1, S).phase).toBe("deal"); });
  it("deal produces the configured number of cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBeGreaterThanOrEqual(CARDS_PER_HAND); });
  it("score is non-negative after one round", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"deal" }); if (i < TOTAL_ROUNDS - 1) s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("rounds counter advances", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"deal" });
    if (TOTAL_ROUNDS > 1) { s = reducer(s, { type:"next" }); expect(s.round).toBeGreaterThanOrEqual(2); }
  });
});

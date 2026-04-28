import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreCardBookshop, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardBookshop", () => {
  it("starts in deal phase", () => { const s = initialState(1, S); expect(s.phase).toBe("deal"); expect(s.score).toBe(0); });
  it("deal produces a pair of cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.pair).not.toBeNull(); expect(s.phase).toBe("decide"); });
  it("take adds two cards to decisions", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"deal" });
    s = reducer(s, { type:"take" });
    expect(s.decisions.length).toBeGreaterThanOrEqual(2);
  });
  it("skip moves to next round without adding", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"deal" });
    s = reducer(s, { type:"skip" });
    expect(s.decisions.length).toBe(0);
    expect(s.round).toBeGreaterThanOrEqual(1);
  });
  it("score function is non-negative for empty hand", () => { expect(scoreCardBookshop([])).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after rounds complete", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"deal" });
      s = reducer(s, { type:"take" });
    }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankValue } from "./state.js";
const S = { dummy: false };
describe("CardPile", () => {
  it("starts in drawing with empty pile", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.pile.length).toBe(0); expect(s.target).toBeGreaterThanOrEqual(15); expect(s.target).toBeLessThanOrEqual(25); });
  it("draw adds a card to the pile", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.pile.length).toBe(1); expect(s.sum).toBeGreaterThan(0); });
  it("stop scores points and moves to scored", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"draw" });
    s = reducer(s, { type:"stop" });
    expect(s.phase).toBe("scored");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("rankValue: A=1, K=13, J=11, 5=5", () => { expect(rankValue(12)).toBe(1); expect(rankValue(11)).toBe(13); expect(rankValue(9)).toBe(11); expect(rankValue(3)).toBe(5); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

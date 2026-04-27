import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_CARDS } from "./state.js";
const S = { dummy: false };
describe("CardPyramidBuild", () => {
  it("starts in playing with empty pyramid and full deck", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.pyramid.length).toBe(TOTAL_CARDS); expect(s.pyramid.every(c => c === null)).toBe(true); expect(s.hand.length).toBe(52); });
  it("place fills slot 0 and increments score by 5", () => { const s = reducer(initialState(1, S), { type:"place", slot:0 }); expect(s.pyramid[0]).not.toBeNull(); expect(s.score).toBe(5); expect(s.current).toBe(1); });
  it("placing in wrong slot does nothing", () => { const s = reducer(initialState(1, S), { type:"place", slot:5 }); expect(s.score).toBe(0); expect(s.current).toBe(0); });
  it("skip discards the next card", () => { const before = initialState(1, S); const s = reducer(before, { type:"skip" }); expect(s.hand.length).toBe(before.hand.length - 1); });
  it("isTerminal null until all cards placed", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("after placing all 10 cards, phase is done", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_CARDS; i++) s = reducer(s, { type:"place", slot:i });
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(50);
  });
});

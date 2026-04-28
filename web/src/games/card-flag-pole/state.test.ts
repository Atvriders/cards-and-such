import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_CARDS, scoreCard } from "./state.js";
const S = { dummy: false };
describe("CardFlagPole", () => {
  it("starts in drawing with empty pile", () => { const s=initialState(1,S); expect(s.phase).toBe("drawing"); expect(s.drawn).toEqual([]); expect(s.score).toBe(0); });
  it("draw adds a card", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.drawn.length).toBe(1); });
  it("score is non-negative after draw", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game completes after TOTAL_CARDS draws", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_CARDS;i++) s=reducer(s,{type:"draw"}); expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("scoreCard returns a number", () => { expect(typeof scoreCard(0)).toBe("number"); });
});

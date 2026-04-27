import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardPoints } from "./state.js";
const S = { dummy: false };
describe("FaceFeast", () => {
  it("starts in ready, score 0", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); expect(s.score).toBe(0); });
  it("draw produces revealed or done", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(["revealed","done"]).toContain(s.phase); expect(s.card).not.toBeNull(); });
  it("score increases by 1 or 5 each draw", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect([1,5]).toContain(s.score); });
  it("cardPoints: Jack of Spades = 5, 2 of Spades = 1", () => { expect(cardPoints(9)).toBe(5); expect(cardPoints(0)).toBe(1); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

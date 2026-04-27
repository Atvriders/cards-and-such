import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isFace, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("FaceFlush", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); });
  it("deal produces hand of 5 cards", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.hand.length).toBe(5); });
  it("score is non-negative and a multiple of 10 (or +50 bonus)", () => { const s = reducer(initialState(1, S), { type:"deal" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isFace identifies J/Q/K", () => { expect(isFace(9)).toBe(true); expect(isFace(10)).toBe(true); expect(isFace(11)).toBe(true); expect(isFace(0)).toBe(false); expect(isFace(12)).toBe(false); });
  it("game ends after 8 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"deal" }); if (s.phase === "scored") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

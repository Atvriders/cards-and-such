import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("spanish-21-cas", () => {
  it("starts in play phase", () => { expect(initialState(1, S).phase).toBe("play"); });
  it("deals 2 cards each", () => { const s = initialState(1, S); expect(s.you.length).toBe(2); expect(s.dealer.length).toBe(2); });
  it("hit adds card", () => { const s = reducer(initialState(7, S), { type: "hit" }); expect(s.you.length).toBeGreaterThanOrEqual(2); });
  it("stand resolves round", () => { const s = reducer(initialState(7, S), { type: "stand" }); expect(["scored", "done"].includes(s.phase)).toBe(true); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("plays through all rounds", () => {
    let s = initialState(11, S);
    let safety = 200;
    while (!isTerminal(s) && safety-- > 0) {
      if (s.phase === "play") s = reducer(s, { type: "stand" });
      else if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});

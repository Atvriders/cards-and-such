import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("banque-cas", () => {
  it("starts in bet phase", () => { expect(initialState(1, S).phase).toBe("bet"); });
  it("score starts at 0", () => { expect(initialState(1, S).score).toBe(0); });
  it("bet on player resolves round", () => { const s = reducer(initialState(7, S), { type: "bet", on: "player" }); expect(["scored", "done"].includes(s.phase)).toBe(true); });
  it("bet draws cards", () => { const s = reducer(initialState(7, S), { type: "bet", on: "banker" }); expect(s.player.length).toBeGreaterThanOrEqual(2); expect(s.banker.length).toBeGreaterThanOrEqual(2); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("plays through all rounds", () => {
    let s = initialState(11, S);
    let safety = 100;
    while (!isTerminal(s) && safety-- > 0) {
      if (s.phase === "bet") s = reducer(s, { type: "bet", on: "banker" });
      else if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});

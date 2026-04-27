import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, shootScore, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceArrow", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); });
  it("shoot produces rolls and ends with 6", () => {
    const s = reducer(initialState(1, S), { type: "shoot" });
    expect(s.rolls.length).toBeGreaterThanOrEqual(1);
    expect(s.rolls[s.rolls.length - 1]).toBe(6);
  });
  it("shootScore: 1 roll = 56, 15 rolls = 0", () => { expect(shootScore(1)).toBe(56); expect(shootScore(15)).toBe(0); });
  it("shootScore non-negative", () => { for (let r = 1; r < 30; r++) expect(shootScore(r)).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "shoot" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

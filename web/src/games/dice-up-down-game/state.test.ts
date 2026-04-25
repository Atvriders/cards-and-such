import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("DiceUpDownGame", () => {
  it("starts with roll between 1-6", () => { const s = initialState(42, S); expect(s.currentRoll).toBeGreaterThanOrEqual(1); expect(s.currentRoll).toBeLessThanOrEqual(6); });
  it("guessing changes currentRoll and advances round", () => { const s = initialState(42, S); const s2 = reducer(s, { type: "guess", dir: "up" }); expect(s2.round).toBe(2); expect(s2.prevRoll).toBe(s.currentRoll); });
  it("correct guess scores points", () => {
    let scored = false;
    for (let seed = 0; seed < 30; seed++) { const s = initialState(seed, S); const s2 = reducer(s, { type: "guess", dir: "up" }); const s3 = reducer(s, { type: "guess", dir: "down" }); if (s2.score > 0 || s3.score > 0) { scored = true; break; } }
    expect(scored).toBe(true);
  });
  it("game ends after all rounds", () => { let s = initialState(1, S); for (let i = 0; i < 5; i++) s = reducer(s, { type: "guess", dir: "up" }); expect(isTerminal(s)).not.toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, MAX_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceStreak", () => {
  it("starts in rolling at 0 rolls", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.rolls).toBe(0); expect(s.score).toBe(0); });
  it("first roll sets streak to 1 and produces a face", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.rolls).toBe(1); expect(s.streak).toBe(1); expect(s.current).toBeGreaterThanOrEqual(1); expect(s.current).toBeLessThanOrEqual(6); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("stop ends the game with score >= 0", () => { const s = reducer(initialState(1, S), { type:"stop" }); expect(s.phase).toBe("done"); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after MAX_ROLLS rolls", () => {
    let s = initialState(1, S);
    for (let i = 0; i < MAX_ROLLS; i++) s = reducer(s, { type:"roll" });
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.bestStreak).toBeGreaterThanOrEqual(1);
  });
});

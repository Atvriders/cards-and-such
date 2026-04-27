import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_FRAMES, DICE_COUNT } from "./state.js";
const S = { dummy: false };
describe("DiceBowl", () => {
  it("starts in rolling", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); });
  it("roll produces 10 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice.length).toBe(DICE_COUNT); });
  it("score is non-negative after roll", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all frames", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

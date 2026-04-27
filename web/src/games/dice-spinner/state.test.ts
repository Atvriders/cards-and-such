import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceSpinner", () => {
  it("starts in betting at roll 1", () => { const s = initialState(1, S); expect(s.phase).toBe("betting"); expect(s.rollNo).toBe(1); });
  it("bet moves to result and reveals a face", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"high" }); expect(s.phase).toBe("result"); expect(s.lastFace).toBeGreaterThanOrEqual(1); expect(s.lastFace).toBeLessThanOrEqual(6); });
  it("score is 0 or 5 after one bet", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"high" }); expect([0,5]).toContain(s.score); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROLLS bets", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROLLS; i++) {
      s = reducer(s, { type:"bet", choice:"low" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});

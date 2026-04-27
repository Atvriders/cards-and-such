import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_RACES } from "./state.js";
const S = { dummy: false };
describe("DiceDerby", () => {
  it("starts in racing", () => { const s = initialState(1, S); expect(s.phase).toBe("racing"); });
  it("roll yields 6 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.lastRoll).not.toBeNull(); expect(s.lastRoll!.length).toBe(6); });
  it("score is non-negative", () => { const s = reducer(initialState(7, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TOTAL_RACES", () => {
    let s = initialState(1, S);
    let safety = 200;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "racing") s = reducer(s, { type:"roll" });
      else if (s.phase === "raceDone") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.race).toBe(TOTAL_RACES);
  });
});

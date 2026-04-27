import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, STAGE_TARGETS } from "./state.js";
const S = { dummy: false };
describe("DiceRelay", () => {
  it("starts in rolling at round 1 stage 0", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); expect(s.stage).toBe(0); });
  it("roll moves to result and produces a roll", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.phase).toBe("result"); expect(s.lastRoll).not.toBeNull(); });
  it("score is 0 or 10 after one roll", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect([0,10]).toContain(s.score); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after running through TOTAL_ROUNDS rounds", () => {
    let s = initialState(1, S);
    let safety = 0;
    while (s.phase !== "done" && safety < 200) {
      s = reducer(s, { type:"roll" });
      s = reducer(s, { type:"next" });
      safety++;
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("STAGE_TARGETS has 4 stages", () => { expect(STAGE_TARGETS.length).toBe(4); });
});

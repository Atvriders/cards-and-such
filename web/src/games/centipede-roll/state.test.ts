import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, targetScore } from "./state.js";
const S = { dummy: false };
describe("CentipedeRoll", () => {
  it("starts in rolling, sum=0", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.sum).toBe(0); });
  it("roll adds to rolls and increases sum", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.rolls.length).toBe(1); expect(s.sum).toBeGreaterThanOrEqual(1); });
  it("stop ends the game", () => { let s = initialState(1, S); s = reducer(s, { type:"roll" }); s = reducer(s, { type:"stop" }); expect(s.phase).toBe("done"); });
  it("targetScore: sum=100 -> 100; sum=80 -> 80; sum=200 -> 0", () => {
    expect(targetScore(100)).toBe(100);
    expect(targetScore(80)).toBe(80);
    expect(targetScore(200)).toBe(0);
  });
  it("isTerminal null during rolling", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

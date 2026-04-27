import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, longestStraight, straightPoints } from "./state.js";
const S = { dummy: false };
describe("StraightShot", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); });
  it("roll produces 5 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice.length).toBe(5); });
  it("score is non-negative after rolling", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("longestStraight: [1,2,3,4,5] = 5", () => { expect(longestStraight([1,2,3,4,5])).toBe(5); });
  it("longestStraight: [1,1,2,4,6] = 2", () => { expect(longestStraight([1,1,2,4,6])).toBe(2); });
  it("straightPoints: 5-straight = 100", () => { expect(straightPoints(5).pts).toBe(100); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, categoryScore } from "./state.js";
const S = { dummy: false };
describe("RollAndWrite", () => {
  it("starts at round 1 in rolling phase", () => {
    const s = initialState(1, S); expect(s.round).toBe(1); expect(s.phase).toBe("rolling");
  });
  it("roll yields 4 dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice.length).toBe(4);
    expect(s.phase).toBe("choosing");
  });
  it("choose advances round and scores", () => {
    let s = reducer(initialState(1, S), { type:"roll" });
    s = reducer(s, { type:"choose", cat:"big" });
    expect(s.round).toBe(2);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(2, S);
    const cats: ("small"|"big"|"evens"|"odds")[] = ["small","big","evens","odds","small","big"];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      s = reducer(s, { type:"choose", cat: cats[i]! });
    }
    expect(s.phase).toBe("done");
  });
  it("categoryScore: small with [1,3,5,6] = 4", () => {
    expect(categoryScore([1,3,5,6], "small")).toBe(4);
    expect(categoryScore([1,3,5,6], "big")).toBe(11);
    expect(categoryScore([2,4,6,1], "evens")).toBe(12);
    expect(categoryScore([2,4,6,1], "odds")).toBe(1);
  });
});

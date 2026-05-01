import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, CATEGORIES, categoryScore } from "./state.js";

const S = { dummy: false };

describe("dice-temple", () => {
  it("starts with empty dice and no scores", () => {
    const s = initialState(1, S);
    expect(s.dice.every(d => d === 0)).toBe(true);
    expect(Object.keys(s.card).length).toBe(0);
  });
  it("roll fills 5 dice", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    expect(s.dice.length).toBe(5);
    s.dice.forEach(d => { expect(d).toBeGreaterThanOrEqual(1); expect(d).toBeLessThanOrEqual(6); });
  });
  it("categoryScore: ones counts 1s", () => {
    expect(categoryScore("ones", [1,1,2,3,4])).toBe(2);
    expect(categoryScore("ones", [2,3,4,5,6])).toBe(0);
  });
  it("categoryScore: temple bonus on 5-of-a-kind", () => {
    expect(categoryScore("temple", [3,3,3,3,3])).toBe(50);
    expect(categoryScore("temple", [3,3,3,3,4])).toBe(0);
  });
  it("categoryScore: full house", () => {
    expect(categoryScore("fullHouse", [2,2,5,5,5])).toBe(25);
    expect(categoryScore("fullHouse", [2,2,5,5,6])).toBe(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game ends after claiming all categories", () => {
    let s = initialState(4, S);
    for (const c of CATEGORIES) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "claim", cat: c });
    }
    expect(s.phase).toBe("done");
  });
});

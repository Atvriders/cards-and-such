import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TURNS } from "./state.js";

const S = { dummy: false };

describe("dice-village", () => {
  it("starts with no buildings", () => {
    const s = initialState(1, S);
    expect(s.built.house).toBe(0);
    expect(s.turn).toBe(1);
  });
  it("roll produces 3 dice", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    expect(s.rolls!.length).toBe(3);
  });
  it("can't build house without low rolls", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    s = { ...s, rolls: [4, 5, 6] };
    const r = reducer(s, { type: "build", what: "house" });
    expect(r).toBe(s);
  });
  it("can build house with a 1 in the roll", () => {
    let s = reducer(initialState(4, S), { type: "roll" });
    s = { ...s, rolls: [1, 5, 6] };
    const r = reducer(s, { type: "build", what: "house" });
    expect(r.built.house).toBe(1);
    expect(r.score).toBeGreaterThan(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(5, S))).toBeNull();
  });
  it("game ends after TURNS turns", () => {
    let s = initialState(6, S);
    for (let i = 0; i < TURNS; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "skip" });
    }
    expect(s.phase).toBe("done");
  });
});

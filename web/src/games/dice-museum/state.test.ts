import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TURNS, setBonus } from "./state.js";

const S = { dummy: false };

describe("dice-museum", () => {
  it("starts empty", () => {
    const s = initialState(1, S);
    expect(s.score).toBe(0);
    expect(Object.values(s.collected).every(v => v === 0)).toBe(true);
  });
  it("setBonus tiers", () => {
    expect(setBonus(0)).toBe(0);
    expect(setBonus(2)).toBe(4);
    expect(setBonus(3)).toBe(12);
    expect(setBonus(6)).toBe(60);
  });
  it("roll then keep adds to a display", () => {
    let s = reducer(initialState(2, S), { type: "roll" });
    expect(s.rolls).not.toBeNull();
    const face = s.rolls![0]!;
    s = reducer(s, { type: "keep", face });
    expect(s.collected[face]).toBeGreaterThan(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game ends after TURNS turns of skipping", () => {
    let s = initialState(4, S);
    for (let i = 0; i < TURNS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "skip" });
    }
    expect(s.phase).toBe("done");
  });
});

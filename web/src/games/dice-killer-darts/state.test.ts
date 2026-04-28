import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT, START_LIVES } from "./state.js";
const S = { dummy: false };
describe("Killer", () => {
  it("starts with full lives", () => {
    const s = initialState(1, S);
    expect(s.lives).toBe(START_LIVES);
  });
  it("roll yields dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice!.length).toBe(DIE_COUNT);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends with non-negative score", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(0);
  });
  it("lives never below zero", () => {
    for (const seed of [1, 7, 200]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
        if (s.phase === "rolling") s = reducer(s, { type:"roll" });
        if (s.phase === "rolled") s = reducer(s, { type:"next" });
        expect(s.lives).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

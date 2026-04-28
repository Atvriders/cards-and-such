import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT } from "./state.js";
const S = { dummy: false };
describe("HalveIt", () => {
  it("starts at zero", () => {
    const s = initialState(1, S);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("rolling");
  });
  it("roll yields dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice!.length).toBe(DIE_COUNT);
  });
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(0);
  });
  it("score never negative", () => {
    for (const seed of [1, 5, 50]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
        if (s.phase === "rolling") s = reducer(s, { type:"roll" });
        if (s.phase === "rolled") s = reducer(s, { type:"next" });
        expect(s.score).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

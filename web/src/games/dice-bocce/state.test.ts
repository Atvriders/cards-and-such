import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT } from "./state.js";
const S = { dummy: false };
describe("DiceBocceState", () => {
  it("starts in rolling phase round 1", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });
  it("roll produces dice and rolled or done", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice).not.toBeNull();
    expect(s.dice!.length).toBe(DIE_COUNT);
    expect(["rolled","done"]).toContain(s.phase);
  });
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after enough rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
  it("score is non-negative across multiple seeds", () => {
    for (const seed of [1, 7, 42, 100]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
        if (s.phase === "rolling") s = reducer(s, { type:"roll" });
        if (s.phase === "rolled") s = reducer(s, { type:"next" });
      }
      const t = isTerminal(s);
      expect(t).not.toBeNull();
      expect(t!.score).toBeGreaterThanOrEqual(0);
    }
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT, START_SCORE } from "./state.js";
const S = { dummy: false };
describe("Dice301State", () => {
  it("starts at full remaining", () => {
    const s = initialState(1, S);
    expect(s.remaining).toBe(START_SCORE);
    expect(s.phase).toBe("rolling");
  });
  it("roll subtracts dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice).not.toBeNull();
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
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
  it("remaining never negative", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
      expect(s.remaining).toBeGreaterThanOrEqual(0);
    }
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-typhoon", () => {
  it("starts at round 1 with empty pool", () => {
    const s = initialState(1, S);
    expect(s.round).toBe(1);
    expect(s.pool).toBe(0);
    expect(s.phase).toBe("roll");
  });
  it("rolling adds to pool unless busted", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    if (!s.busted) expect(s.pool).toBeGreaterThan(0);
    else expect(s.pool).toBe(0);
  });
  it("bank moves pool to score and advances round", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    const before = s.score;
    const banking = s.pool;
    s = reducer(s, { type: "bank" });
    expect(s.score).toBe(before + banking);
    expect(s.round).toBe(2);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after ROUNDS banks", () => {
    let s = initialState(5, S);
    for (let i = 0; i < ROUNDS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "roll" });
      s = reducer(s, { type: "bank" });
    }
    expect(s.phase).toBe("done");
  });
});

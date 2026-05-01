import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, MAX_ROLLS } from "./state.js";

const S = { dummy: false };

describe("dice-storm", () => {
  it("starts at 0 pool", () => {
    const s = initialState(1, S);
    expect(s.pool).toBe(0);
    expect(s.rollsTaken).toBe(0);
  });
  it("rolling adds to pool unless snake eyes", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    if (s.rolls[0] === 1 && s.rolls[1] === 1) expect(s.pool).toBe(0);
    else expect(s.pool).toBeGreaterThan(0);
  });
  it("bank ends the game", () => {
    let s = reducer(initialState(3, S), { type: "roll" });
    s = reducer(s, { type: "bank" });
    expect(s.phase).toBe("done");
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("rolling MAX times ends game", () => {
    let s = initialState(5, S);
    for (let i = 0; i < MAX_ROLLS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "roll" });
    }
    expect(s.phase).toBe("done");
  });
});

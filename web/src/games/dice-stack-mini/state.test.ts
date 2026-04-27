import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceStackMini", () => {
  it("starts in rolling, stack 0", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.stackSize).toBe(0); });
  it("first roll always stacks (lastDie=0)", () => { const s = reducer(initialState(1, S), { type: "roll" }); expect(s.stackSize).toBe(1); expect(s.score).toBeGreaterThanOrEqual(21); });
  it("score is non-negative across full play", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});

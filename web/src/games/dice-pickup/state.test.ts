import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DICE_COUNT } from "./state.js";
const S = { dummy: false };
describe("DicePickup", () => {
  it("starts in picking with 8 dice and a target", () => { const s = initialState(1, S); expect(s.phase).toBe("picking"); expect(s.dice.length).toBe(DICE_COUNT); expect(s.target).toBeGreaterThanOrEqual(1); expect(s.target).toBeLessThanOrEqual(6); });
  it("pick toggles selection of a die", () => { const s = reducer(initialState(1, S), { type:"pick", index:0 }); expect(s.picked[0]).toBe(true); });
  it("submit moves to result and updates score (>=0)", () => {
    let s = initialState(1, S);
    for (let i = 0; i < s.dice.length; i++) if (s.dice[i] === s.target) s = reducer(s, { type:"pick", index:i });
    s = reducer(s, { type:"submit" });
    expect(s.phase).toBe("result");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      s = reducer(s, { type:"submit" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

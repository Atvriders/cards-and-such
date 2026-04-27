import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceShipping", () => {
  it("starts with 3 ships of 3 dice", () => { const s = initialState(1, S); expect(s.ships.length).toBe(3); expect(s.ships[0]!.length).toBe(3); });
  it("pick scores ship sum", () => { const s = reducer(initialState(1, S), { type:"pick", ship: 0 }); expect(s.score).toBeGreaterThanOrEqual(3); });
  it("score is bounded by max sum", () => { const s = reducer(initialState(1, S), { type:"pick", ship: 1 }); expect(s.score).toBeLessThanOrEqual(18); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"pick", ship: 0 });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceHighRoll", () => {
  it("starts with 100 coins in betting phase", () => { const s = initialState(1, S); expect(s.coins).toBe(100); expect(s.phase).toBe("betting"); });
  it("bet transitions phase", () => { const s = reducer(initialState(2, S), { type:"bet", amount:5 }); expect(["result","gameover"]).toContain(s.phase); });
  it("coins non-negative after bet", () => { const s = reducer(initialState(3, S), { type:"bet", amount:5 }); expect(s.coins).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});

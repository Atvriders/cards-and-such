import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardThrowBet", () => {
  it("starts with 100 coins in betting phase", () => { const s = initialState(1, S); expect(s.coins).toBe(100); expect(s.phase).toBe("betting"); });
  it("bet transitions phase", () => { const s = reducer(initialState(2, S), { type:"bet", amount:5, color:"red" }); expect(["result","gameover"]).toContain(s.phase); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(3, S))).toBeNull(); });
  it("coins non-negative after bet", () => { const s = reducer(initialState(4, S), { type:"bet", amount:5, color:"black" }); expect(s.coins).toBeGreaterThanOrEqual(0); });
});

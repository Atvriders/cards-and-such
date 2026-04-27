import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniSpit", () => {
  it("starts in play with 6 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("play"); expect(s.hand.length).toBe(6); });
  it("end transitions phase", () => { const s = reducer(initialState(1, S), { type:"end" }); expect(["scored","done"]).toContain(s.phase); });
  it("score is non-negative", () => { expect(initialState(1, S).score).toBe(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});

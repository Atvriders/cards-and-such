import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DiceBlockade", () => {
  it("starts rolling", () => { expect(initialState(1,S).phase).toBe("rolling"); });
  it("roll yields 1..6 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.you).toBeGreaterThanOrEqual(1); expect(s.opp).toBeLessThanOrEqual(6); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("scored phase after roll", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(["scored","done"]).toContain(s.phase); });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, pointsFor } from "./state.js";
const S = { dummy: false };
describe("DicePhotography", () => {
  it("starts in rolling with score 0", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.score).toBe(0); expect(s.round).toBe(0); });
  it("roll advances round", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.round).toBe(1); expect(s.lastRoll).toBeGreaterThanOrEqual(1); expect(s.lastRoll).toBeLessThanOrEqual(6); });
  it("score is non-negative after roll", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after TOTAL_ROUNDS rolls", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_ROUNDS;i++) s=reducer(s,{type:"roll"}); expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("pointsFor returns number", () => { for(let r=1;r<=6;r++) expect(typeof pointsFor(r)).toBe("number"); });
});

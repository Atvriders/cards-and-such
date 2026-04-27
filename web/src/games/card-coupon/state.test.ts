import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS, couponValue } from "./state.js";
const S = { dummy: false };
describe("CardCoupon", () => {
  it("starts in playing", () => { const s = initialState(1,S); expect(s.phase).toBe("playing"); expect(s.score).toBe(0); });
  it("Ace coupon is 0", () => { expect(couponValue(12)).toBe(0); });
  it("draw advances and earns score", () => { const s = reducer(initialState(1,S),{type:"draw"}); expect(s.drawIdx).toBe(1); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after all draws", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"}); expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

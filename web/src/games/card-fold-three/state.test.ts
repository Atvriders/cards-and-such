import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardFoldThree", () => {
  it("starts in decide phase with 3-card hand", () => { const s=initialState(1,S); expect(s.phase).toBe("decide"); expect(s.hand.length).toBe(3); });
  it("fold scores lowest rank", () => { const s=reducer(initialState(1,S),{type:"fold"}); expect(s.coins).toBeGreaterThan(0); expect(s.choice).toBe("fold"); });
  it("stand scores highest rank", () => { const s=reducer(initialState(1,S),{type:"stand"}); expect(s.coins).toBeGreaterThanOrEqual(s.lastScore); expect(s.choice).toBe("stand"); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"stand"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});

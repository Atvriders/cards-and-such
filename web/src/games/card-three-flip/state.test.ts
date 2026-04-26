import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardThreeFlip", () => {
  it("starts in waiting phase with 0 coins", () => { const s=initialState(1,S); expect(s.phase).toBe("waiting"); expect(s.coins).toBe(0); });
  it("flip reveals 3 cards and earns points", () => { const s=reducer(initialState(1,S),{type:"flip"}); expect(s.flipped.length).toBe(3); expect(s.coins).toBeGreaterThan(0); });
  it("phase becomes revealed after flip", () => { const s=reducer(initialState(1,S),{type:"flip"}); expect(s.phase).toBe("revealed"); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"flip"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});

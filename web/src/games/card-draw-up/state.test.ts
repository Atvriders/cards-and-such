import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("CardDrawUp", () => {
  it("starts in drawing phase with empty hand", () => { const s=initialState(1,S); expect(s.phase).toBe("drawing"); expect(s.drawn.length).toBe(0); });
  it("draw adds card to hand", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.drawn.length).toBe(1); expect(s.total).toBeGreaterThan(0); });
  it("stop scores current total", () => { let s=initialState(1,S); s=reducer(s,{type:"draw"}); s=reducer(s,{type:"stop"}); expect(s.coins).toBeGreaterThan(0); expect(s.phase).toBe("result"); });
  it("gameover after all rounds", () => { let s=initialState(1,S); for(let i=0;i<5;i++){s=reducer(s,{type:"draw"});s=reducer(s,{type:"stop"});s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});

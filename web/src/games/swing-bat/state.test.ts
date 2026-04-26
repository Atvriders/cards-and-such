import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Swing Bat", () => {
  it("starts aiming", () => { expect(initialState(1,S).phase).toBe("aiming"); });
  it("throw changes phase", () => { const s=reducer(initialState(1,S),{type:"throw"}); expect(["result","done"]).toContain(s.phase); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"throw"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("done after 10 rounds", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"throw"});if(s.phase==="result")s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});

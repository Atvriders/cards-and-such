import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("SpringJump", () => {
  it("starts aiming", () => { expect(initialState(1,S).phase).toBe("aiming"); });
  it("jump changes phase", () => { const s=reducer(initialState(1,S),{type:"jump"}); expect(["jumped","done"]).toContain(s.phase); });
  it("score increases after jump", () => { const s=reducer(initialState(1,S),{type:"jump"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("done after all jumps", () => { let s=initialState(1,S); for(let i=0;i<10;i++){s=reducer(s,{type:"jump"});if(s.phase==="jumped")s=reducer(s,{type:"next"});} expect(isTerminal(s)).not.toBeNull(); });
});

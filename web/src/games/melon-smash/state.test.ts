import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S={rounds:"5" as const};
describe("MelonSmash",()=>{
  it("starts with target>0",()=>{ const s=initialState(42,S); expect(s.target).toBeGreaterThan(0); });
  it("tapping increases current",()=>{ const s=initialState(42,S); const s2=reducer(s,{type:"tap"}); expect(s2.current).toBe(1); });
  it("completing target scores",()=>{ let s=initialState(42,S); for(let i=0;i<s.target;i++) s=reducer(s,{type:"tap"}); expect(s.score).toBeGreaterThan(0); });
  it("game ends after all rounds",()=>{ let s=initialState(1,S); for(let r=0;r<5;r++){ const t=s.target; for(let i=0;i<t;i++) s=reducer(s,{type:"tap"}); } expect(isTerminal(s)).not.toBeNull(); });
});

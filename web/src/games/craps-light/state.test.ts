import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CrapsLight", () => {
  it("starts betting", () => { expect(initialState(1,S).phase).toBe("betting"); });
  it("bet rolls dice and yields outcome", () => { const s=reducer(initialState(1,S),{type:"bet", bet:"pass"}); expect(s.dice).not.toBeNull(); expect(["win","lose","push"]).toContain(s.outcome); });
  it("score is 0 or 10 after one round", () => { const s=reducer(initialState(1,S),{type:"bet", bet:"pass"}); expect([0,10]).toContain(s.score); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after rounds", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_ROUNDS;i++){ s=reducer(s,{type:"bet", bet:"pass"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceDuel", () => {
  it("starts ready", () => { expect(initialState(1,S).phase).toBe("ready"); });
  it("duel rolls both sides", () => { const s=reducer(initialState(1,S),{type:"duel"}); expect(s.you).not.toBeNull(); expect(s.cpu).not.toBeNull(); });
  it("score is 0 or 10 after one duel", () => { const s=reducer(initialState(1,S),{type:"duel"}); expect([0,10]).toContain(s.score); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_ROUNDS;i++){ s=reducer(s,{type:"duel"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});

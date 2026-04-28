import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rankOf } from "./state.js";
const S = { dummy: false };
describe("CardFan", () => {
  it("starts in choose with 5 cards", () => { const s=initialState(1,S); expect(s.phase).toBe("choose"); expect(s.hand.length).toBe(5); });
  it("pick records pick", () => { const s=reducer(initialState(1,S),{type:"pick",index:0}); expect(s.pick).toBe(0); });
  it("picking the highest wins", () => {
    const s=initialState(1,S);
    let bestI=0; for(let i=1;i<s.hand.length;i++) if(rankOf(s.hand[i]!)>rankOf(s.hand[bestI]!)) bestI=i;
    const s2=reducer(s,{type:"pick",index:bestI}); expect(s2.lastWin).toBe(true);
  });
  it("rankOf 0..12", () => { for(let c=0;c<52;c++){ expect(rankOf(c)).toBeLessThanOrEqual(12);} });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, comboScore, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("YahtzeeMini", () => {
  it("starts in rolling with 5 dice", () => { const s=initialState(1,S); expect(s.phase).toBe("rolling"); expect(s.dice.length).toBe(5); });
  it("comboScore: 5 sixes = 80", () => { expect(comboScore([6,6,6,6,6])).toBe(80); });
  it("comboScore: full house = 25", () => { expect(comboScore([3,3,3,5,5])).toBe(25); });
  it("toggle hold flag", () => { const s=reducer(initialState(1,S),{type:"toggle", index:0}); expect(s.held[0]).toBe(true); });
  it("score moves to scored phase", () => { const s=reducer(initialState(1,S),{type:"score"}); expect(["scored","done"]).toContain(s.phase); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rounds", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_ROUNDS;i++){ s=reducer(s,{type:"score"}); if(s.phase==="scored") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROLLS } from "./state.js";
const S = { dummy: false };
describe("SnakeEyesHunt", () => {
  it("starts rolling", () => { expect(initialState(1,S).phase).toBe("rolling"); });
  it("roll yields 2 dice", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect(s.dice).not.toBeNull(); expect(s.dice![0]).toBeGreaterThanOrEqual(1); expect(s.dice![0]).toBeLessThanOrEqual(6); });
  it("score is 0 or 50 after one roll", () => { const s=reducer(initialState(1,S),{type:"roll"}); expect([0,50]).toContain(s.score); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after all rolls", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_ROLLS;i++){ s=reducer(s,{type:"roll"}); if(s.phase==="result") s=reducer(s,{type:"next"}); }
    expect(s.phase).toBe("done");
  });
});

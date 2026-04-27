import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("Card Snake", () => {
  it("starts in drawing phase", () => { const s=initialState(1,S); expect(s.phase).toBe("drawing"); expect(s.draws).toBe(0); expect(s.bestRun).toBe(0); });
  it("first draw sets run to 1", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.currentRun).toBe(1); expect(s.bestRun).toBeGreaterThanOrEqual(1); });
  it("score after full game is non-negative", () => {
    let s=initialState(11,S);
    for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"});
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while drawing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after total draws", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"});
    expect(s.phase).toBe("done");
  });
});

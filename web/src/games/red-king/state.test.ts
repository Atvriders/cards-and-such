import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS } from "./state.js";
const S = { dummy: false };
describe("Red King", () => {
  it("starts in drawing phase with no draws", () => { const s=initialState(1,S); expect(s.phase).toBe("drawing"); expect(s.draws).toBe(0); expect(s.score).toBe(0); });
  it("draw increments draws and adds to drawn", () => { const s=reducer(initialState(1,S),{type:"draw"}); expect(s.draws).toBe(1); expect(s.drawn.length).toBe(1); });
  it("score is non-negative and >= 0 after draws", () => {
    let s=initialState(7,S);
    for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"});
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while drawing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("game ends after total draws", () => {
    let s=initialState(1,S);
    for(let i=0;i<TOTAL_DRAWS;i++) s=reducer(s,{type:"draw"});
    expect(s.phase).toBe("done");
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, pipValue, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("PipPyramid", () => {
  it("starts dealing", () => { expect(initialState(1,S).phase).toBe("dealing"); });
  it("pipValue: 2 -> 2, A -> 14", () => { expect(pipValue(0)).toBe(2); expect(pipValue(12)).toBe(14); });
  it("deal yields 5 cards", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.hand.length).toBe(5); });
  it("score non-negative after deal", () => { const s=reducer(initialState(1,S),{type:"deal"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("ends after rounds", () => { let s=initialState(1,S); for(let i=0;i<TOTAL_ROUNDS;i++){ s=reducer(s,{type:"deal"}); if(s.phase==="scored") s=reducer(s,{type:"next"}); } expect(s.phase).toBe("done"); });
  it("isTerminal null mid-game", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

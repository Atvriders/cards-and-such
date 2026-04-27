import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_CARDS } from "./state.js";
const S = { dummy: false };
describe("CardToss", () => {
  it("starts with first card", () => { const s = initialState(1,S); expect(s.phase).toBe("playing"); expect(s.current).not.toBeNull(); expect(s.deck.length).toBe(TOTAL_CARDS); });
  it("toss advances index", () => { const s = reducer(initialState(1,S), { type:"toss", pile:"red" }); expect(s.idx).toBe(1); });
  it("score is non-negative", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_CARDS;i++) s = reducer(s,{type:"toss",pile:"red"}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("game ends after all cards", () => { let s = initialState(1,S); for(let i=0;i<TOTAL_CARDS;i++) s = reducer(s,{type:"toss",pile:"red"}); expect(s.phase).toBe("done"); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

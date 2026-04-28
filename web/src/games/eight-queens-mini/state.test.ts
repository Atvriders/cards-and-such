import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SIZE } from "./state.js";
const S = { dummy: false };
describe("EightQueensMini", () => {
  it("starts in playing phase with empty board", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.queens.length).toBe(SIZE*SIZE); });
  it("toggle places a queen", () => { const s=reducer(initialState(1,S), { type:"toggle", idx:0 }); expect(s.queens[0]).toBe(true); });
  it("invalid submit shows message and no advance", () => {
    let s=initialState(1,S);
    s=reducer(s, { type:"toggle", idx:0 });
    s=reducer(s, { type:"submit" });
    expect(s.message.length).toBeGreaterThanOrEqual(1);
    expect(s.score).toBe(0);
  });
  it("valid 4-queens submit advances", () => {
    // 4-queens valid: cols [1,3,0,2] across rows 0,1,2,3 -> idx 1,7,8,14
    let s=initialState(1,S);
    [1,7,8,14].forEach(i=>{s=reducer(s,{type:"toggle",idx:i});});
    s=reducer(s,{type:"submit"});
    expect(s.score).toBeGreaterThanOrEqual(25);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S: { rounds: "5" } = { rounds: "5" };
describe("QuartetMatch", () => {
  it("starts with 7 cards selecting", () => { const s = initialState(1, S); expect(s.hand.length).toBe(7); expect(s.phase).toBe("selecting"); });
  it("toggle adds and removes selection", () => { let s = initialState(1, S); s = reducer(s,{type:"toggle",idx:0}); expect(s.selected).toEqual([0]); s = reducer(s,{type:"toggle",idx:0}); expect(s.selected).toEqual([]); });
  it("submit with 4 selections moves to scored", () => {
    let s = initialState(1, S);
    s = reducer(s,{type:"toggle",idx:0});
    s = reducer(s,{type:"toggle",idx:1});
    s = reducer(s,{type:"toggle",idx:2});
    s = reducer(s,{type:"toggle",idx:3});
    s = reducer(s,{type:"submit"});
    expect(s.phase).toBe("scored");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal returns score when done", () => { const s = { ...initialState(1, S), phase:"done" as const }; expect(isTerminal(s)).not.toBeNull(); });
});

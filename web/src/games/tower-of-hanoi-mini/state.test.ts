import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { discs: "3" as const };

describe("tower-of-hanoi-mini", () => {
  it("starts with all discs on first peg", () => {
    const s = initialState(1, S);
    expect(s.pegs[0]!.length).toBe(3);
    expect(s.pegs[1]!.length).toBe(0);
    expect(s.pegs[2]!.length).toBe(0);
  });
  it("starts in playing", () => { expect(initialState(1, S).phase).toBe("playing"); });
  it("can move top disc to empty peg", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tap", peg: 0 });
    s = reducer(s, { type: "tap", peg: 2 });
    expect(s.pegs[2]!.length).toBeGreaterThanOrEqual(1);
    expect(s.moves).toBe(1);
  });
  it("disallows large-on-small", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tap", peg: 0 });
    s = reducer(s, { type: "tap", peg: 2 });
    // Now try to move a bigger disc onto the smaller one
    s = reducer(s, { type: "tap", peg: 0 });
    s = reducer(s, { type: "tap", peg: 2 });
    // Move shouldn't have happened (peg 2 still has just 1)
    expect(s.pegs[2]!.length).toBe(1);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("reset clears moves", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "tap", peg: 0 });
    s = reducer(s, { type: "tap", peg: 1 });
    s = reducer(s, { type: "reset" });
    expect(s.moves).toBe(0);
  });
});

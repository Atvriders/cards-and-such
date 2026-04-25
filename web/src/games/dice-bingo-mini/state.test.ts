import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rolls: "15" as const };

describe("DiceBingoMini", () => {
  it("creates 3x3 card", () => {
    const s = initialState(1, S);
    expect(s.card.length).toBe(3);
    expect(s.card[0]!.length).toBe(3);
  });
  it("rolling marks matching cells", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.rollCount).toBe(1);
    expect(s2.score).toBeGreaterThanOrEqual(5);
  });
  it("marked cells stay marked after further rolls", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    const marked1 = s.marked.map(r => [...r]);
    s = reducer(s, { type: "roll" });
    marked1.forEach((row, r) => row.forEach((m, c) => { if (m) expect(s.marked[r]![c]).toBe(true); }));
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});

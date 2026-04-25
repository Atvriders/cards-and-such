import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardPoints } from "./state.js";

const S = { rows: "5" as const };

describe("CardPyramidGrab", () => {
  it("creates pyramid with correct rows", () => {
    const s = initialState(1, S);
    expect(s.pyramid.length).toBe(5);
  });
  it("picking a card reveals it and adds points", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "pick", col: 0 });
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.selectedInRow).toBe(0);
  });
  it("cannot pick twice in same row", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "pick", col: 0 });
    const s3 = reducer(s2, { type: "pick", col: 1 });
    expect(s3.score).toBe(s2.score);
  });
  it("isTerminal returns score when gameover", () => {
    let s = initialState(1, { rows: "3" as const });
    for (let i = 0; i < 3; i++) { s = reducer(s, { type: "pick", col: 0 }); s = reducer(s, { type: "next" }); }
    expect(isTerminal(s)).not.toBeNull();
    expect(typeof cardPoints(s.pyramid[0]![0]!)).toBe("number");
  });
});

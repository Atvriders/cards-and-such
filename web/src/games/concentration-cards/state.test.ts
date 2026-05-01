import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PAIR_COUNT, TOTAL_CARDS, SCORE_MATCH } from "./state.js";

const S = { dummy: false };

describe("ConcentrationCards", () => {
  it("starts with TOTAL_CARDS slots and zero matches", () => {
    const s = initialState(1, S);
    expect(s.values.length).toBe(TOTAL_CARDS);
    expect(s.matches).toBe(0);
    expect(s.score).toBe(0);
  });
  it("each pair value appears exactly twice", () => {
    const s = initialState(7, S);
    const counts = new Map<number, number>();
    s.values.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
    for (let i = 0; i < PAIR_COUNT; i++) expect(counts.get(i)).toBe(2);
  });
  it("flipping records flipped indices", () => {
    const s = reducer(initialState(1, S), { type: "flip", index: 0 });
    expect(s.flipped).toContain(0);
    const s2 = reducer(s, { type: "flip", index: 1 });
    expect(s2.flipped.length).toBe(2);
  });
  it("rejects a third flip until resolve", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "flip", index: 0 });
    s = reducer(s, { type: "flip", index: 1 });
    const s3 = reducer(s, { type: "flip", index: 2 });
    expect(s3.flipped.length).toBe(2);
  });
  it("matching pair scores SCORE_MATCH and reveals", () => {
    const s = initialState(1, S);
    const v = s.values[0];
    const partner = s.values.findIndex((x, i) => i !== 0 && x === v);
    let s2 = reducer(s, { type: "flip", index: 0 });
    s2 = reducer(s2, { type: "flip", index: partner });
    s2 = reducer(s2, { type: "resolve" });
    expect(s2.score).toBe(SCORE_MATCH);
    expect(s2.matches).toBe(1);
    expect(s2.revealed[0]).toBe(true);
    expect(s2.revealed[partner]).toBe(true);
  });
  it("isTerminal null at start, true when all matched", () => {
    let s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
    while (s.matches < PAIR_COUNT) {
      const next = s.values.findIndex((_, i) => !s.revealed[i]);
      const partner = s.values.findIndex((x, i) => i !== next && x === s.values[next] && !s.revealed[i]);
      s = reducer(s, { type: "flip", index: next });
      s = reducer(s, { type: "flip", index: partner });
      s = reducer(s, { type: "resolve" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});

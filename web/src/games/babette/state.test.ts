import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Babette initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    const colCards = s.columns.reduce((sum, c) => sum + c.length, 0);
    expect(colCards + s.hand.length).toBe(52);
  });

  it("has 10 columns of 5 cards", () => {
    const s = initialState(2);
    expect(s.columns.length).toBe(10);
    for (const col of s.columns) expect(col.length).toBe(5);
  });

  it("hand has 2 cards", () => {
    const s = initialState(3);
    expect(s.hand.length).toBe(2);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.columns[0]!.map((c) => c.id)).toEqual(s2.columns[0]!.map((c) => c.id));
  });
});

describe("Babette reducer", () => {
  it("draw-hand increments handIndex", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "draw-hand" });
    expect(next.handIndex).toBe(1);
  });

  it("draw-hand beyond end does nothing", () => {
    const s = initialState(5);
    let cur = reducer(s, { type: "draw-hand" });
    cur = reducer(cur, { type: "draw-hand" });
    const after = reducer(cur, { type: "draw-hand" });
    expect(after.handIndex).toBe(cur.handIndex);
  });

  it("invalid col-to-foundation is rejected", () => {
    const s = initialState(10);
    const next = reducer(s, { type: "move-col-to-foundation", colIndex: 0, foundIndex: 0 });
    // Only rejected if card doesn't fit (Ace needed)
    const col0Top = s.columns[0]![4]!;
    if (col0Top.rank !== 1) {
      expect(next.foundations[0]!.length).toBe(0);
    } else {
      expect(next.foundations[0]!.length).toBe(1);
    }
  });

  it("invalid col-to-col is rejected if no legal target", () => {
    const s = initialState(10);
    // Moving col 0 top to col 0 (same) should be rejected
    const next = reducer(s, { type: "move-col-to-col", fromCol: 0, toCol: 0 });
    expect(next).toBe(s);
  });
});

describe("Babette isTerminal", () => {
  it("returns null at start", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true, score: 260 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(260);
  });
});

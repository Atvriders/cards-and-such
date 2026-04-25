import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Archway initialState", () => {
  it("deals exactly 104 cards total across fans and stock", () => {
    const s = initialState(1);
    const fanCards = s.fans.reduce((sum, f) => sum + f.length, 0);
    expect(fanCards + s.stock.length).toBe(104);
  });

  it("has 12 fans of 4 cards each", () => {
    const s = initialState(2);
    expect(s.fans.length).toBe(12);
    for (const fan of s.fans) expect(fan.length).toBe(4);
  });

  it("starts with 8 empty foundations", () => {
    const s = initialState(3);
    expect(s.foundations.length).toBe(8);
    for (const f of s.foundations) expect(f.length).toBe(0);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(42);
    const s2 = initialState(42);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });
});

describe("Archway reducer — draw", () => {
  it("draw reduces stock by 1", () => {
    const s = initialState(5);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
  });

  it("draw on empty stock leaves state unchanged", () => {
    const s = initialState(7);
    // Draw everything
    let cur = s;
    while (cur.stock.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const after = reducer(cur, { type: "draw" });
    expect(after.stock.length).toBe(0);
    expect(after.movesMade).toBe(cur.movesMade);
  });
});

describe("Archway reducer — move-fan", () => {
  it("out-of-range fan index is rejected", () => {
    const s = initialState(10);
    const next = reducer(s, { type: "move-fan", fanIndex: 999, toPile: "f0" });
    expect(next).toBe(s);
  });

  it("invalid foundation target is rejected", () => {
    const s = initialState(10);
    const next = reducer(s, { type: "move-fan", fanIndex: 0, toPile: "f99" });
    expect(next).toBe(s);
  });
});

describe("Archway isTerminal", () => {
  it("returns null when not won and stock remains", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won flag is set", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true, score: 104 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(104);
  });
});

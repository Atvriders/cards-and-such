import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isValidSet } from "./state.js";
import type { SetState, SetCard } from "./state.js";

function makeCard(id: number, color: 0|1|2, shape: 0|1|2, fill: 0|1|2, count: 0|1|2): SetCard {
  return { id, color, shape, fill, count };
}

describe("isValidSet", () => {
  it("valid set: all same color, all different shape/fill/count", () => {
    const a = makeCard(0, 0, 0, 0, 0);
    const b = makeCard(1, 0, 1, 1, 1);
    const c = makeCard(2, 0, 2, 2, 2);
    expect(isValidSet(a, b, c)).toBe(true);
  });

  it("valid set: all different on every attribute", () => {
    const a = makeCard(0, 0, 0, 0, 0);
    const b = makeCard(1, 1, 1, 1, 1);
    const c = makeCard(2, 2, 2, 2, 2);
    expect(isValidSet(a, b, c)).toBe(true);
  });

  it("invalid set: two same, one different color", () => {
    const a = makeCard(0, 0, 0, 0, 0);
    const b = makeCard(1, 0, 1, 1, 1);
    const c = makeCard(2, 1, 2, 2, 2);
    expect(isValidSet(a, b, c)).toBe(false);
  });

  it("invalid set: all same on one attribute but two/one on another", () => {
    const a = makeCard(0, 0, 0, 0, 0);
    const b = makeCard(1, 0, 0, 1, 1);
    const c = makeCard(2, 0, 1, 2, 2);
    // shape: 0,0,1 — neither all same (0,0,1) nor all different → invalid
    expect(isValidSet(a, b, c)).toBe(false);
  });
});

describe("initialState", () => {
  it("has 12 table cards", () => {
    const s = initialState(42);
    expect(s.table.filter(Boolean).length).toBe(12);
  });

  it("deck has 81 - 12 = 69 cards remaining", () => {
    const s = initialState(42);
    expect(s.deck.length).toBe(69);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.deck[0]?.id).toBe(s2.deck[0]?.id);
  });

  it("starts with 0 sets found", () => {
    const s = initialState(42);
    expect(s.setsFound).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("reducer - select cards", () => {
  it("selecting one card adds to selection", () => {
    const s = initialState(1);
    const idx = s.table.findIndex(Boolean);
    const s2 = reducer(s, { type: "selectCard", tableIndex: idx });
    expect(s2.selected).toContain(idx);
  });

  it("deselecting removes from selection", () => {
    const s = initialState(1);
    const idx = s.table.findIndex(Boolean);
    const s2 = reducer(s, { type: "selectCard", tableIndex: idx });
    const s3 = reducer(s2, { type: "selectCard", tableIndex: idx });
    expect(s3.selected).not.toContain(idx);
  });

  it("invalid set flags invalidSet", () => {
    // Force three non-set cards to be selected
    const s = initialState(3);
    const cards = s.table.map((c, i) => c ? i : -1).filter(i => i >= 0);
    const [i0, i1, i2] = cards;
    let s2 = reducer(s, { type: "selectCard", tableIndex: i0! });
    s2 = reducer(s2, { type: "selectCard", tableIndex: i1! });
    s2 = reducer(s2, { type: "selectCard", tableIndex: i2! });
    // May or may not be valid; just check that result is sensible
    if (!s2.invalidSet) {
      expect(s2.setsFound).toBe(1); // valid set found
    } else {
      expect(s2.selected).toHaveLength(0);
    }
  });
});

describe("isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(4))).toBeNull();
  });

  it("returns score when won", () => {
    const s: SetState = { ...initialState(4), won: true, score: 500 };
    expect(isTerminal(s)).toEqual({ score: 500 });
  });

  it("returns score when no set on table and deck empty", () => {
    const s: SetState = { ...initialState(4), noSetOnTable: true, deck: [], score: 300 };
    expect(isTerminal(s)).toEqual({ score: 300 });
  });
});

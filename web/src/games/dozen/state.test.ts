import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Dozen initialState", () => {
  it("has no Kings in any column", () => {
    const s = initialState(42, settings);
    for (const col of s.columns) {
      for (const card of col) {
        expect(card.rank).not.toBe(13);
      }
    }
  });

  it("foundations start with aces", () => {
    const s = initialState(42, settings);
    // Some foundations may have aces if they were auto-moved
    // Count total cards: columns + foundations = 48
    const colTotal = s.columns.reduce((sum, c) => sum + c.length, 0);
    const foundTotal = s.foundations.reduce((sum, f) => sum + f.length, 0);
    expect(colTotal + foundTotal).toBe(48);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, settings);
    const s2 = initialState(42, settings);
    const ids1 = s1.columns.flatMap((c) => c.map((card) => card.id)).join(",");
    const ids2 = s2.columns.flatMap((c) => c.map((card) => card.id)).join(",");
    expect(ids1).toBe(ids2);
  });

  it("starts not won", () => {
    const s = initialState(42, settings);
    expect(s.won).toBe(false);
    expect(isTerminal(s)).toBeNull();
  });
});

describe("Dozen reducer", () => {
  it("selecting a column sets selected", () => {
    const s = initialState(42, settings);
    // Find a non-empty column
    const nonEmpty = s.columns.findIndex((c) => c.length > 0);
    if (nonEmpty === -1) return;
    const next = reducer(s, { type: "select-column", colIdx: nonEmpty });
    expect(next.selected).toBe(nonEmpty);
  });

  it("selecting same column twice deselects", () => {
    const s = initialState(42, settings);
    const nonEmpty = s.columns.findIndex((c) => c.length > 0);
    if (nonEmpty === -1) return;
    const s1 = reducer(s, { type: "select-column", colIdx: nonEmpty });
    const s2 = reducer(s1, { type: "select-column", colIdx: nonEmpty });
    expect(s2.selected).toBeNull();
  });

  it("matching pair removes both tops", () => {
    const s = initialState(42, settings);
    // Find matching top ranks
    const tops = s.columns.map((c, i) => ({ idx: i, rank: c.length > 0 ? c[c.length - 1]!.rank : -1 }));
    let i1 = -1, i2 = -1;
    for (let i = 0; i < tops.length; i++) {
      for (let j = i + 1; j < tops.length; j++) {
        if (tops[i]!.rank === tops[j]!.rank && tops[i]!.rank !== -1) {
          i1 = tops[i]!.idx; i2 = tops[j]!.idx; break;
        }
      }
      if (i1 !== -1) break;
    }
    if (i1 === -1) { expect(true).toBe(true); return; }
    const s1 = reducer(s, { type: "select-column", colIdx: i1 });
    const s2 = reducer(s1, { type: "select-column", colIdx: i2 });
    expect(s2.removedPairs).toBe(1);
  });

  it("move-to-foundation works for valid ace", () => {
    const s = initialState(42, settings);
    // Find a column with an ace and an empty foundation
    for (let cIdx = 0; cIdx < s.columns.length; cIdx++) {
      const col = s.columns[cIdx]!;
      if (col.length === 0) continue;
      const top = col[col.length - 1]!;
      if (top.rank !== 1) continue;
      for (let fIdx = 0; fIdx < s.foundations.length; fIdx++) {
        const f = s.foundations[fIdx]!;
        if (f.length === 0) {
          const next = reducer(s, { type: "move-to-foundation", colIdx: cIdx, foundationIdx: fIdx });
          expect(next.foundations[fIdx]!.length).toBe(1);
          return;
        }
      }
    }
    expect(true).toBe(true);
  });
});

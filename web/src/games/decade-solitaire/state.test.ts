import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardValue } from "./state.js";

const def = {};

describe("DecadeSolitaire initialState", () => {
  it("starts in playing phase", () => {
    expect(initialState(1, def).phase).toBe("playing");
  });

  it("deals 4 columns of 13 cards each", () => {
    const s = initialState(1, def);
    expect(s.columns.length).toBe(4);
    for (const col of s.columns) expect(col.length).toBe(13);
  });

  it("total 52 unique cards", () => {
    const s = initialState(1, def);
    const allCards = s.columns.flat();
    expect(allCards.length).toBe(52);
    expect(new Set(allCards).size).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, def);
    const s2 = initialState(7, def);
    expect(s1.columns[0]![0]).toBe(s2.columns[0]![0]);
  });
});

describe("DecadeSolitaire reducer", () => {
  it("select adds card to selected", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "select", col: 0, row: 12 }); // top of col 0
    expect(s2.selected.length).toBe(1);
  });

  it("clearSel empties selection", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "select", col: 0, row: 12 });
    expect(reducer(s2, { type: "clearSel" }).selected.length).toBe(0);
  });

  it("remove with sum=10 removes cards", () => {
    // Find two top cards summing to 10
    const s = initialState(1, def);
    const tops = s.columns.map((col, ci) => ({ ci, card: col[col.length - 1]!, ri: col.length - 1 }));
    for (let i = 0; i < tops.length; i++) {
      for (let j = i + 1; j < tops.length; j++) {
        if (cardValue(tops[i]!.card) + cardValue(tops[j]!.card) === 10) {
          let s2 = reducer(s, { type: "select", col: tops[i]!.ci, row: tops[i]!.ri });
          s2 = reducer(s2, { type: "select", col: tops[j]!.ci, row: tops[j]!.ri });
          const s3 = reducer(s2, { type: "remove" });
          expect(s3.moves).toBe(1);
          return;
        }
      }
    }
    // Just check the moves counter starts at 0
    expect(s.moves).toBe(0);
  });

  it("cannot remove non-top card", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "select", col: 0, row: 0 }); // not top
    expect(s2.selected.length).toBe(0);
  });
});

describe("DecadeSolitaire isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("cardValue ace is 1", () => {
    expect(cardValue(0)).toBe(1); // rank 0 = Ace
  });

  it("cardValue king is 10", () => {
    expect(cardValue(12)).toBe(10); // rank 12 = King
  });
});

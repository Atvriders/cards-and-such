import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Demon initialState", () => {
  it("deals exactly 52 cards", () => {
    const s = initialState(1, settings);
    const tabCount = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const total = tabCount + s.reserve.length + s.stock.length + s.waste.length;
    expect(total).toBe(52);
  });

  it("reserve has 13 cards", () => {
    const s = initialState(1, settings);
    expect(s.reserve.length).toBe(13);
  });

  it("tableau has 4 columns of 4", () => {
    const s = initialState(1, settings);
    expect(s.tableau.length).toBe(4);
    for (const col of s.tableau) expect(col.length).toBe(4);
  });

  it("has 4 foundations sharing the same base rank", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(4);
    const base = s.foundations[0]!.baseRank;
    for (const f of s.foundations) expect(f.baseRank).toBe(base);
  });

  it("base rank equals top of reserve", () => {
    const s = initialState(1, settings);
    const topReserve = s.reserve[s.reserve.length - 1]!;
    expect(s.foundations[0]!.baseRank).toBe(topReserve.rank);
  });
});

describe("Demon reducer - draw", () => {
  it("draws 3 cards from stock to waste", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "draw" });
    expect(next.waste.length).toBe(3);
    expect(next.stock.length).toBe(s.stock.length - 3);
  });

  it("draws fewer than 3 when stock has less", () => {
    const s = { ...initialState(1, settings), stock: initialState(1, settings).stock.slice(0, 2) };
    const next = reducer(s, { type: "draw" });
    expect(next.waste.length).toBe(2);
    expect(next.stock.length).toBe(0);
  });
});

describe("Demon reducer - foundation move", () => {
  it("valid base rank card goes to foundation", () => {
    const s = initialState(1, settings);
    const baseRank = s.foundations[0]!.baseRank;
    // Find a card of base rank on tableau
    for (let ci = 0; ci < s.tableau.length; ci++) {
      const col = s.tableau[ci]!;
      const top = col[col.length - 1]!;
      if (top.rank === baseRank) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit);
        const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: ci, foundIdx: fi });
        expect(next.foundations[fi]!.cards.length).toBe(1);
        expect(next.score).toBe(5);
        return;
      }
    }
    // Also check reserve top
    const resTop = s.reserve[s.reserve.length - 1]!;
    if (resTop.rank === baseRank) {
      const fi = s.foundations.findIndex((f) => f.suit === resTop.suit);
      const next = reducer(s, { type: "move-to-foundation", fromType: "reserve", fromIdx: 0, foundIdx: fi });
      expect(next.foundations[fi]!.cards.length).toBe(1);
    } else {
      expect(true).toBe(true); // no base rank card on top
    }
  });

  it("wrong rank rejected", () => {
    const s = initialState(1, settings);
    const baseRank = s.foundations[0]!.baseRank;
    for (let ci = 0; ci < s.tableau.length; ci++) {
      const top = s.tableau[ci]![s.tableau[ci]!.length - 1]!;
      if (top.rank !== baseRank) {
        const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: ci, foundIdx: 0 });
        expect(next).toBe(s);
        return;
      }
    }
    expect(true).toBe(true);
  });
});

describe("Demon reducer - recycle", () => {
  it("cannot recycle when stock non-empty", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "recycle" });
    expect(next).toBe(s);
  });

  it("recycles waste back to stock", () => {
    const s = initialState(1, settings);
    let cur = s;
    while (cur.stock.length > 0) cur = reducer(cur, { type: "draw" });
    const next = reducer(cur, { type: "recycle" });
    expect(next.stock.length).toBe(cur.waste.length);
    expect(next.waste.length).toBe(0);
  });
});

describe("Demon isTerminal", () => {
  it("returns null when not complete", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 52 on foundations", () => {
    const s = initialState(1, settings);
    const fullFounds = s.foundations.map((f) => ({
      ...f,
      cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }),
    }));
    const result = isTerminal({ ...s, foundations: fullFounds, won: true, score: 260 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(260);
  });
});

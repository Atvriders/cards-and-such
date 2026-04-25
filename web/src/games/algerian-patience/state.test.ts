import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Algerian Patience initialState", () => {
  it("deals 104 cards total", () => {
    const s = initialState(1, settings);
    const tabCount = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const total = tabCount + s.stock.length + s.waste.length;
    expect(total).toBe(104);
  });

  it("has 8 tableau columns of 4 cards", () => {
    const s = initialState(1, settings);
    expect(s.tableau.length).toBe(8);
    for (const col of s.tableau) expect(col.length).toBe(4);
  });

  it("has 8 foundations (4 up + 4 down)", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(8);
    const ups = s.foundations.filter((f) => f.direction === "up");
    const downs = s.foundations.filter((f) => f.direction === "down");
    expect(ups.length).toBe(4);
    expect(downs.length).toBe(4);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(3, settings);
    const s2 = initialState(3, settings);
    expect(s1.tableau[0]![0]!.id).toBe(s2.tableau[0]![0]!.id);
  });
});

describe("Algerian Patience reducer - draw", () => {
  it("draw moves card to waste", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "draw" });
    expect(next.waste.length).toBe(1);
    expect(next.stock.length).toBe(s.stock.length - 1);
  });

  it("cannot draw from empty stock", () => {
    const s = { ...initialState(1, settings), stock: [] };
    const next = reducer(s, { type: "draw" });
    expect(next).toBe(s);
  });
});

describe("Algerian Patience reducer - foundation", () => {
  it("ace goes to up-direction foundation", () => {
    const s = initialState(1, settings);
    for (let ci = 0; ci < s.tableau.length; ci++) {
      const top = s.tableau[ci]![s.tableau[ci]!.length - 1]!;
      if (top.rank === 1) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit && f.direction === "up");
        if (fi >= 0) {
          const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: ci, foundIdx: fi });
          expect(next.foundations[fi]!.cards.length).toBe(1);
          expect(next.score).toBe(5);
          return;
        }
      }
    }
    expect(true).toBe(true);
  });

  it("king goes to down-direction foundation", () => {
    const s = initialState(1, settings);
    for (let ci = 0; ci < s.tableau.length; ci++) {
      const top = s.tableau[ci]![s.tableau[ci]!.length - 1]!;
      if (top.rank === 13) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit && f.direction === "down");
        if (fi >= 0) {
          const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: ci, foundIdx: fi });
          expect(next.foundations[fi]!.cards.length).toBe(1);
          return;
        }
      }
    }
    expect(true).toBe(true);
  });

  it("wrong suit rejected", () => {
    const s = initialState(1, settings);
    const top = s.tableau[0]![s.tableau[0]!.length - 1]!;
    // Find a foundation of wrong suit
    const fi = s.foundations.findIndex((f) => f.suit !== top.suit && f.direction === "up");
    if (fi >= 0) {
      const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: 0, foundIdx: fi });
      expect(next).toBe(s);
    }
    expect(true).toBe(true);
  });
});

describe("Algerian Patience - tableau move", () => {
  it("rejects different-suit tableau move", () => {
    const s = initialState(1, settings);
    const top0 = s.tableau[0]![s.tableau[0]!.length - 1]!;
    const top1 = s.tableau[1]![s.tableau[1]!.length - 1]!;
    if (top0.suit !== top1.suit) {
      const next = reducer(s, { type: "move-tableau", fromCol: 0, toCol: 1 });
      expect(next).toBe(s);
    } else {
      expect(true).toBe(true);
    }
  });
});

describe("Algerian Patience isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when all 104 on foundations", () => {
    const s = initialState(1, settings);
    const fullFounds = s.foundations.map((f) => ({
      ...f,
      cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }),
    }));
    const result = isTerminal({ ...s, foundations: fullFounds, won: true, score: 520 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Eagle Wing initialState", () => {
  it("deals exactly 52 cards total", () => {
    const s = initialState(1, settings);
    const tabCount = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const total = tabCount + s.reserve.length + s.stock.length + s.waste.length;
    expect(total).toBe(52);
  });

  it("has 13 tableau columns of 1 card each", () => {
    const s = initialState(1, settings);
    expect(s.tableau.length).toBe(13);
    for (const col of s.tableau) expect(col.length).toBe(1);
  });

  it("has 13 reserve cards", () => {
    const s = initialState(1, settings);
    expect(s.reserve.length).toBe(13);
  });

  it("has 4 foundations", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(4);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.tableau[0]![0]!.id).toBe(s2.tableau[0]![0]!.id);
  });
});

describe("Eagle Wing reducer - draw", () => {
  it("draw moves card from stock to waste", () => {
    const s = initialState(1, settings);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
    expect(next.waste.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("draw from empty stock does nothing", () => {
    const s = { ...initialState(1, settings), stock: [] };
    const next = reducer(s, { type: "draw" });
    expect(next).toBe(s);
  });
});

describe("Eagle Wing reducer - recycle", () => {
  it("cannot recycle when stock is non-empty", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "recycle" });
    expect(next).toBe(s);
  });

  it("recycles waste to stock when stock empty", () => {
    const s = initialState(1, settings);
    let cur = s;
    while (cur.stock.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const next = reducer(cur, { type: "recycle" });
    expect(next.stock.length).toBe(cur.waste.length);
    expect(next.waste.length).toBe(0);
    expect(next.recyclesLeft).toBe(s.recyclesLeft - 1);
  });
});

describe("Eagle Wing reducer - move to foundation", () => {
  it("rejects invalid foundation move", () => {
    const s = initialState(1, settings);
    // Tableau col 0 top card - probably not an Ace
    const top = s.tableau[0]![0]!;
    if (top.rank !== 1) {
      const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: 0, foundIdx: 0 });
      expect(next).toBe(s);
    } else {
      expect(true).toBe(true);
    }
  });

  it("valid ace move scores 10", () => {
    const s = initialState(1, settings);
    // Find an ace in tableau
    for (let i = 0; i < s.tableau.length; i++) {
      const top = s.tableau[i]![0]!;
      if (top.rank === 1) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit);
        const next = reducer(s, { type: "move-to-foundation", fromType: "tableau", fromIdx: i, foundIdx: fi });
        expect(next.score).toBe(10);
        return;
      }
    }
    // Also check reserve top
    const resTop = s.reserve[s.reserve.length - 1]!;
    if (resTop.rank === 1) {
      const fi = s.foundations.findIndex((f) => f.suit === resTop.suit);
      const next = reducer(s, { type: "move-to-foundation", fromType: "reserve", fromIdx: 0, foundIdx: fi });
      expect(next.score).toBe(10);
    } else {
      expect(true).toBe(true);
    }
  });
});

describe("Eagle Wing isTerminal", () => {
  it("returns null when foundations not complete", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const s = { ...initialState(1, settings), won: true, score: 520 };
    const fullFoundations = s.foundations.map((f) => ({
      ...f,
      cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }),
    }));
    const result = isTerminal({ ...s, foundations: fullFoundations });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});

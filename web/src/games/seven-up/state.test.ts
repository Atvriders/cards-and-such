import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("SevenUp initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    const tab = s.tableau.reduce((sum, c) => sum + c.length, 0);
    expect(tab + s.stock.length).toBe(52);
  });

  it("has 7 tableau columns", () => {
    const s = initialState(2);
    expect(s.tableau.length).toBe(7);
    for (let i = 0; i < 7; i++) expect(s.tableau[i]!.length).toBe(i + 1);
  });

  it("stock has 24 cards", () => {
    const s = initialState(3);
    expect(s.stock.length).toBe(24);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });
});

describe("SevenUp reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(5);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
    expect(next.waste.length).toBe(1);
  });

  it("draw on empty stock does nothing", () => {
    const s = initialState(5);
    let cur = s;
    while (cur.stock.length > 0) cur = reducer(cur, { type: "draw" });
    const after = reducer(cur, { type: "draw" });
    expect(after).toBe(cur);
  });

  it("recycle moves waste to stock when stock empty", () => {
    const s = initialState(5);
    let cur = s;
    while (cur.stock.length > 0) cur = reducer(cur, { type: "draw" });
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.stock.length).toBeGreaterThan(0);
    expect(recycled.waste.length).toBe(0);
  });

  it("foundation does not accept Ace when empty (needs 7)", () => {
    const s = initialState(5);
    // First draw to get a waste card
    let cur = reducer(s, { type: "draw" });
    const wasteTop = cur.waste[0]!;
    if (wasteTop.rank !== 7) {
      const next = reducer(cur, { type: "move-to-foundation", fromPile: "waste", foundIndex: 0 });
      expect(next.foundations[0]!.length).toBe(0);
    }
  });
});

describe("SevenUp isTerminal", () => {
  it("returns null while stock/waste remain", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const won = { ...s, won: true, score: 520 };
    expect(isTerminal(won)!.score).toBe(520);
  });
});

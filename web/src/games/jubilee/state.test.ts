import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Jubilee initialState", () => {
  it("deals exactly 104 cards total", () => {
    const s = initialState(1, settings);
    const tableauCount = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const total = tableauCount + s.stock.length + s.waste.length;
    expect(total).toBe(104);
  });

  it("has 8 foundations", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(8);
  });

  it("has 10 tableau columns of 5 cards each", () => {
    const s = initialState(1, settings);
    expect(s.tableau.length).toBe(10);
    for (const col of s.tableau) expect(col.length).toBe(5);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.tableau[0]![0]!.id).toBe(s2.tableau[0]![0]!.id);
  });
});

describe("Jubilee reducer - draw", () => {
  it("drawing moves a card from stock to waste", () => {
    const s = initialState(1, settings);
    const stockBefore = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(stockBefore - 1);
    expect(next.waste.length).toBe(1);
  });

  it("cannot draw from empty stock", () => {
    const s = { ...initialState(1, settings), stock: [] };
    const next = reducer(s, { type: "draw" });
    expect(next).toBe(s);
  });
});

describe("Jubilee reducer - move tableau", () => {
  it("moves top card between tableau columns", () => {
    const s = initialState(1, settings);
    const fromLen = s.tableau[0]!.length;
    const toLen = s.tableau[1]!.length;
    const next = reducer(s, { type: "move-tableau", fromCol: 0, toCol: 1 });
    expect(next.tableau[0]!.length).toBe(fromLen - 1);
    expect(next.tableau[1]!.length).toBe(toLen + 1);
  });

  it("same-column move does nothing", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "move-tableau", fromCol: 0, toCol: 0 });
    expect(next).toBe(s);
  });
});

describe("Jubilee isTerminal", () => {
  it("returns null when foundations not full", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, settings), won: true, score: 520 };
    const result = isTerminal({ ...s, foundations: s.foundations.map((f) => ({ ...f, cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }) })) });
    // Total should be 104
    expect(result).not.toBeNull();
  });
});

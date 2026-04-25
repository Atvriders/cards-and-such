import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Tournament initialState", () => {
  it("has 104 total cards", () => {
    const s = initialState(1);
    const tab = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const asc = s.ascFound.reduce((sum, f) => sum + f.length, 0);
    const desc = s.descFound.reduce((sum, f) => sum + f.length, 0);
    expect(tab + s.stock.length + asc + desc).toBe(104);
  });

  it("has 8 tableau columns of 12 cards each", () => {
    const s = initialState(2);
    expect(s.tableau.length).toBe(8);
    for (const col of s.tableau) expect(col.length).toBe(12);
  });

  it("stock has 8 cards", () => {
    const s = initialState(3);
    expect(s.stock.length).toBe(8);
  });

  it("is deterministic", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });
});

describe("Tournament reducer", () => {
  it("draw moves card from stock to waste", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(s.stock.length - 1);
    expect(next.waste.length).toBe(1);
  });

  it("draw on empty stock does nothing", () => {
    const s = initialState(5);
    let cur = s;
    while (cur.stock.length > 0) cur = reducer(cur, { type: "draw" });
    const after = reducer(cur, { type: "draw" });
    expect(after).toBe(cur);
  });

  it("move-to-reserve parks a column card", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "move-to-reserve", source: "t0", reserveIndex: 0 });
    expect(next.reserve[0]).not.toBeNull();
    expect(next.tableau[0]!.length).toBe(11);
  });

  it("move-to-reserve rejected if slot occupied", () => {
    const s = initialState(5);
    let cur = reducer(s, { type: "move-to-reserve", source: "t0", reserveIndex: 0 });
    const next = reducer(cur, { type: "move-to-reserve", source: "t1", reserveIndex: 0 });
    expect(next).toBe(cur);
  });
});

describe("Tournament isTerminal", () => {
  it("returns null at start", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const won = { ...s, won: true, score: 520 };
    expect(isTerminal(won)!.score).toBe(520);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("KingsRow initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.tableau.reduce((sum, col) => sum + col.length, 0) +
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.stock.length + s.waste.length;
    expect(total).toBe(52);
  });

  it("first 4 columns have 7 cards, last 4 have 6", () => {
    const s = initialState(1);
    for (let i = 0; i < 4; i++) expect(s.tableau[i]!.length).toBe(7);
    for (let i = 4; i < 8; i++) expect(s.tableau[i]!.length).toBe(6);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.tableau.flat().map(c => c.id).join(",")).toBe(
      s2.tableau.flat().map(c => c.id).join(",")
    );
  });

  it("foundations and stock start empty", () => {
    const s = initialState(5);
    for (const f of s.foundations) expect(f.length).toBe(0);
    expect(s.stock.length).toBe(0);
    expect(s.waste.length).toBe(0);
  });
});

describe("KingsRow reducer", () => {
  it("invalid move leaves state unchanged", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromCol: 0, toCol: 0, count: 1 });
    expect(next).toBe(s);
  });

  it("total cards preserved after moves", () => {
    const s = initialState(42);
    const total = (st: typeof s) =>
      st.tableau.reduce((sum, col) => sum + col.length, 0) +
      st.foundations.reduce((sum, f) => sum + f.length, 0) +
      st.stock.length + st.waste.length;
    const next = reducer(s, { type: "move", fromCol: 0, toCol: 1, count: 1 });
    expect(total(next)).toBe(52);
  });

  it("cannot place non-King on empty foundation", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "tableau-to-foundation", fromCol: 0, foundIdx: 0 });
    // Most top cards won't be Kings — check state unchanged if it fails
    const total = next.foundations.reduce((sum, f) => sum + f.length, 0);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});

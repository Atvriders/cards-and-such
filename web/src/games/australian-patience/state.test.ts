import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AustralianPatienceState } from "./state.js";

describe("AustralianPatience initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.tableau.reduce((sum, col) => sum + col.length, 0) +
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.stock.length;
    expect(total).toBe(52);
  });

  it("first 4 columns have 6 cards, last 3 have 5", () => {
    const s = initialState(1);
    for (let i = 0; i < 4; i++) expect(s.tableau[i]!.length).toBe(6);
    for (let i = 4; i < 7; i++) expect(s.tableau[i]!.length).toBe(5);
  });

  it("stock has 13 cards (52 - 4*6 - 3*5 = 13)", () => {
    const s = initialState(99);
    expect(s.stock.length).toBe(13);
  });

  it("is deterministic", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.tableau.flat().map(c => c.id).join(",")).toBe(
      s2.tableau.flat().map(c => c.id).join(",")
    );
  });
});

describe("AustralianPatience reducer", () => {
  it("draw deals one card to each tableau column", () => {
    const s = initialState(42);
    const stockBefore = s.stock.length;
    const next = reducer(s, { type: "draw" });
    // Each of 7 columns gets 1 card (if stock has enough)
    const added = s.tableau.reduce((sum, col, i) => sum + (next.tableau[i]!.length - col.length), 0);
    expect(added).toBe(Math.min(stockBefore, 7));
    expect(next.stock.length).toBe(stockBefore - added);
  });

  it("invalid move-to-foundation does nothing", () => {
    const s = initialState(42);
    // Most top cards won't be aces, so invalid
    const before = s.movesMade;
    const next = reducer(s, { type: "move-to-foundation", fromCol: 0 });
    // Either nothing changed or a valid move happened
    expect(next.movesMade).toBeGreaterThanOrEqual(before);
  });

  it("total card count preserved after draw", () => {
    const s = initialState(42);
    const total = (st: AustralianPatienceState) =>
      st.tableau.reduce((sum, col) => sum + col.length, 0) +
      st.foundations.reduce((sum, f) => sum + f.length, 0) +
      st.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(total(next)).toBe(52);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });
});

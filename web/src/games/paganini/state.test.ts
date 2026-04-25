import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Paganini initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.tableau.reduce((sum, col) => sum + col.length, 0) +
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.stock.length + s.waste.length;
    expect(total).toBe(52);
  });

  it("first 4 columns have 7, last 4 have 6", () => {
    const s = initialState(1);
    for (let i = 0; i < 4; i++) expect(s.tableau[i]!.length).toBe(7);
    for (let i = 4; i < 8; i++) expect(s.tableau[i]!.length).toBe(6);
  });

  it("has 8 foundations starting empty", () => {
    const s = initialState(5);
    expect(s.foundations.length).toBe(8);
    for (const f of s.foundations) expect(f.length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(77);
    const s2 = initialState(77);
    expect(s1.tableau.flat().map(c => c.id).join(",")).toBe(
      s2.tableau.flat().map(c => c.id).join(",")
    );
  });
});

describe("Paganini reducer", () => {
  it("invalid same-column move returns same state", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromCol: 0, toCol: 0, count: 1 });
    expect(next).toBe(s);
  });

  it("total cards preserved after move attempt", () => {
    const s = initialState(42);
    const total = (st: typeof s) =>
      st.tableau.reduce((sum, col) => sum + col.length, 0) +
      st.foundations.reduce((sum, f) => sum + f.length, 0) +
      st.stock.length + st.waste.length;
    const next = reducer(s, { type: "move", fromCol: 0, toCol: 1, count: 1 });
    expect(total(next)).toBe(52);
  });

  it("tableau-to-foundation with non-Ace fails", () => {
    const s = initialState(42);
    const before = s.foundations.reduce((sum, f) => sum + f.length, 0);
    // Try to send top of col 0 to foundation 0 — unless it's an Ace, it should fail
    const col0top = s.tableau[0]![s.tableau[0]!.length - 1]!;
    const next = reducer(s, { type: "tableau-to-foundation", fromCol: 0, foundIdx: 0 });
    const after = next.foundations.reduce((sum, f) => sum + f.length, 0);
    if (col0top.rank !== 1) expect(after).toBe(before);
    else expect(after).toBe(before + 1);
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});

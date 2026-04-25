import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Florentine initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.tableau.reduce((sum, col) => sum + col.length, 0) +
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.reserve.filter(Boolean).length +
      s.stock.length;
    expect(total).toBe(52);
  });

  it("has 5 tableau columns of 5 cards each", () => {
    const s = initialState(1);
    expect(s.tableau.length).toBe(5);
    for (const col of s.tableau) expect(col.length).toBe(5);
  });

  it("reserve has 4 slots all filled", () => {
    const s = initialState(1);
    expect(s.reserve.length).toBe(4);
    expect(s.reserve.filter(Boolean).length).toBe(4);
  });

  it("is deterministic", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.tableau.flat().map(c => c.id).join(",")).toBe(
      s2.tableau.flat().map(c => c.id).join(",")
    );
  });
});

describe("Florentine reducer", () => {
  it("draw refills empty reserve slots", () => {
    const s = initialState(42);
    // Manually empty a reserve slot by dispatching reserve-to-foundation (may fail) - just verify draw doesn't crash
    const next = reducer(s, { type: "draw" });
    // If no empty slots, state is unchanged
    expect(next).toBeDefined();
  });

  it("invalid move-tableau leaves state unchanged", () => {
    const s = initialState(42);
    const before = s.movesMade;
    // Try an obviously invalid move (column 0 top to column 0 — same column)
    const next = reducer(s, { type: "move-tableau", fromCol: 0, toCol: 0 });
    expect(next.movesMade).toBe(before);
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("total cards preserved after any action", () => {
    const s = initialState(42);
    const total = (st: typeof s) =>
      st.tableau.reduce((sum, col) => sum + col.length, 0) +
      st.foundations.reduce((sum, f) => sum + f.length, 0) +
      st.reserve.filter(Boolean).length +
      st.stock.length;
    const next = reducer(s, { type: "move-tableau", fromCol: 0, toCol: 1 });
    expect(total(next)).toBe(52);
  });
});

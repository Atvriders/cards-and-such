import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("FourLeafClover initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.leaves.reduce((sum, l) => sum + l.length, 0) +
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.reserve.filter(Boolean).length;
    expect(total).toBe(52);
  });

  it("each leaf has 13 cards", () => {
    const s = initialState(1);
    for (const leaf of s.leaves) expect(leaf.length).toBe(13);
  });

  it("each leaf contains only one suit", () => {
    const s = initialState(3);
    const suits = ["♠", "♥", "♦", "♣"];
    for (let i = 0; i < 4; i++) {
      const suit = suits[i]!;
      for (const card of s.leaves[i]!) expect(card.suit).toBe(suit);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(9);
    const s2 = initialState(9);
    expect(s1.leaves.flat().map(c => c.id).join(",")).toBe(
      s2.leaves.flat().map(c => c.id).join(",")
    );
  });
});

describe("FourLeafClover reducer", () => {
  it("leaf-to-reserve puts card in empty slot", () => {
    const s = initialState(42);
    const card = s.leaves[0]![s.leaves[0]!.length - 1]!;
    const next = reducer(s, { type: "leaf-to-reserve", leafIdx: 0, reserveIdx: 0 });
    expect(next.reserve[0]?.id).toBe(card.id);
    expect(next.leaves[0]!.length).toBe(12);
  });

  it("leaf-to-reserve to occupied slot is rejected", () => {
    let s = initialState(42);
    s = reducer(s, { type: "leaf-to-reserve", leafIdx: 0, reserveIdx: 0 });
    const before = s.leaves[1]!.length;
    const next = reducer(s, { type: "leaf-to-reserve", leafIdx: 1, reserveIdx: 0 });
    expect(next.leaves[1]!.length).toBe(before); // no change
  });

  it("total cards preserved", () => {
    const s = initialState(42);
    const total = (st: typeof s) =>
      st.leaves.reduce((sum, l) => sum + l.length, 0) +
      st.foundations.reduce((sum, f) => sum + f.length, 0) +
      st.reserve.filter(Boolean).length;
    const next = reducer(s, { type: "leaf-to-reserve", leafIdx: 0, reserveIdx: 0 });
    expect(total(next)).toBe(52);
  });

  it("isTerminal null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});

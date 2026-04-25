import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalDiscards } from "./state.js";

describe("LastMonarch initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    expect(s.row.length).toBe(52);
  });

  it("all cards are non-null initially", () => {
    const s = initialState(2);
    expect(s.row.every((c) => c !== null)).toBe(true);
  });

  it("is deterministic", () => {
    const s1 = initialState(42);
    const s2 = initialState(42);
    expect(s1.row.map((c) => c?.id)).toEqual(s2.row.map((c) => c?.id));
  });

  it("different seeds produce different rows", () => {
    const s1 = initialState(1);
    const s2 = initialState(2);
    expect(s1.row.map((c) => c?.id).join(",")).not.toEqual(s2.row.map((c) => c?.id).join(","));
  });
});

describe("LastMonarch reducer", () => {
  it("discard removes a card at the given index", () => {
    const s = initialState(5);
    const moves = legalDiscards(s.row);
    if (moves.length === 0) return; // edge case
    const idx = moves[0]!;
    const next = reducer(s, { type: "discard", index: idx });
    expect(next.row[idx]).toBeNull();
    expect(next.movesMade).toBe(1);
  });

  it("illegal discard is rejected", () => {
    const s = initialState(5);
    // Discard index 0 if it's not legal
    const moves = legalDiscards(s.row);
    const illegalIdx = s.row.findIndex((_, i) => !moves.includes(i));
    if (illegalIdx >= 0) {
      const next = reducer(s, { type: "discard", index: illegalIdx });
      expect(next).toBe(s);
    }
  });

  it("out-of-range index is rejected", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "discard", index: 999 });
    expect(next).toBe(s);
  });

  it("score increments on valid discard", () => {
    const s = initialState(7);
    const moves = legalDiscards(s.row);
    if (moves.length === 0) return;
    const next = reducer(s, { type: "discard", index: moves[0]! });
    expect(next.score).toBe(s.score + 1);
  });
});

describe("LastMonarch isTerminal", () => {
  it("returns null when legal moves exist", () => {
    const s = initialState(1);
    const moves = legalDiscards(s.row);
    if (moves.length > 0) {
      expect(isTerminal(s)).toBeNull();
    }
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true, score: 48 };
    expect(isTerminal(wonState)!.score).toBe(100);
  });
});

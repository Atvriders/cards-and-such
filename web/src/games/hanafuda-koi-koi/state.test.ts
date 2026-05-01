import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreCaptured, DECK, TOTAL_ROUNDS, HAND_SIZE, FIELD_SIZE } from "./state.js";

const S = { dummy: false };

describe("HanafudaKoiKoi", () => {
  it("deck has 48 cards across 12 months", () => {
    expect(DECK.length).toBe(48);
    const counts = new Map<number, number>();
    for (const c of DECK) counts.set(c.month, (counts.get(c.month) ?? 0) + 1);
    for (let m = 1; m <= 12; m++) expect(counts.get(m)).toBe(4);
  });

  it("initial state deals correctly", () => {
    const s = initialState(7, S);
    expect(s.hand.length).toBe(HAND_SIZE);
    expect(s.cpuHand.length).toBe(HAND_SIZE);
    expect(s.field.length).toBe(FIELD_SIZE);
    expect(s.deck.length).toBe(48 - HAND_SIZE * 2 - FIELD_SIZE);
    expect(s.phase).toBe("select");
    expect(s.score).toBe(0);
  });

  it("selecting a hand card stores it", () => {
    const s = initialState(11, S);
    const c = s.hand[0]!;
    const next = reducer(s, { type: "select", cardId: c });
    expect(next.selected).toBe(c);
  });

  it("scoreCaptured returns 0 for empty captures", () => {
    expect(scoreCaptured([])).toBe(0);
  });

  it("scoreCaptured rewards 5+ tan", () => {
    const tans = DECK.filter(c => c.category === "tan").slice(0, 5).map(c => c.id);
    expect(scoreCaptured(tans)).toBeGreaterThanOrEqual(1);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });

  it("respects TOTAL_ROUNDS constant", () => {
    expect(TOTAL_ROUNDS).toBeGreaterThan(0);
  });
});

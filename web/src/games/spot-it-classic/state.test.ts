import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SYMBOLS_PER_CARD, TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("Spot It Classic", () => {
  it("creates TOTAL_ROUNDS rounds", () => {
    const s = initialState(1, S);
    expect(s.rounds.length).toBe(TOTAL_ROUNDS);
  });
  it("each round has two cards each with SYMBOLS_PER_CARD symbols", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.cardA.symbols.length).toBe(SYMBOLS_PER_CARD);
      expect(r.cardB.symbols.length).toBe(SYMBOLS_PER_CARD);
    }
  });
  it("the shared symbol appears on both cards", () => {
    const s = initialState(7, S);
    for (const r of s.rounds) {
      expect(r.cardA.symbols).toContain(r.shared);
      expect(r.cardB.symbols).toContain(r.shared);
    }
  });
  it("correct pick scores at least 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(s, { type: "select", symbol: r.shared, nowMs: 1000 });
    expect(s2.score).toBeGreaterThanOrEqual(10);
    expect(s2.correctCount).toBe(1);
  });
  it("incorrect pick scores 0", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const wrong = r.cardA.symbols.find(x => x !== r.shared)!;
    const s2 = reducer(s, { type: "select", symbol: wrong, nowMs: 500 });
    expect(s2.score).toBe(0);
    expect(s2.correctCount).toBe(0);
  });
  it("game completes after all rounds", () => {
    let s = initialState(42, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const r = s.rounds[s.currentIndex]!;
      s = reducer(s, { type: "select", symbol: r.shared, nowMs: 0 });
      s = reducer(s, { type: "next", nowMs: 0 });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});

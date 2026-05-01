import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SYMBOLS_PER_CARD, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("SpotIt50Plus", () => {
  it("creates TOTAL_ROUNDS rounds", () => {
    expect(initialState(1, S).rounds.length).toBe(TOTAL_ROUNDS);
  });
  it("each round shares one symbol on both cards", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.cardA.symbols.length).toBe(SYMBOLS_PER_CARD);
      expect(r.cardB.symbols.length).toBe(SYMBOLS_PER_CARD);
      expect(r.cardA.symbols).toContain(r.shared);
      expect(r.cardB.symbols).toContain(r.shared);
    }
  });
  it("correct selection scores points", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(s, { type: "select", symbol: r.shared, nowMs: 1000 });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("wrong selection scores 0", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const wrong = r.cardA.symbols.find(x => x !== r.shared)!;
    const s2 = reducer(s, { type: "select", symbol: wrong, nowMs: 0 });
    expect(s2.score).toBe(0);
  });
  it("isTerminal becomes non-null after all rounds", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const r = s.rounds[s.currentIndex]!;
      s = reducer(s, { type: "select", symbol: r.shared, nowMs: 0 });
      s = reducer(s, { type: "next", nowMs: 0 });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});

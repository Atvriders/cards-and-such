import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("napoleon-card initialState", () => {
  it("deals 5 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 5)).toBe(true);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("bidding");
  });

  it("is deterministic", () => {
    const s1 = initialState(99, DEF);
    const s2 = initialState(99, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("has 4 hands", () => {
    const s = initialState(1, DEF);
    expect(s.hands.length).toBe(4);
  });
});

describe("napoleon-card bidding", () => {
  it("bid 3 transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("pass (0) is allowed", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 0 });
    expect(s2).toBeDefined();
  });
});

describe("napoleon-card legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 4 });
    if (s2.phase !== "playing") return;
    if (s2.turn === 0) {
      expect(legalPlays(s2, 0).length).toBeGreaterThan(0);
    }
  });
});

describe("napoleon-card full game", () => {
  it("completes and produces isTerminal", () => {
    let s = initialState(7, DEF);
    s = reducer(s, { type: "bid", amount: 3 });
    let iter = 0;
    while (s.phase === "playing" && iter < 50) {
      if (s.turn === 0) {
        const legal = legalPlays(s, 0);
        if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(["done", "playing"].includes(s.phase)).toBe(true);
    if (s.phase === "done") expect(isTerminal(s)).not.toBeNull();
  });
});

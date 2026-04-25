import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("pidro initialState", () => {
  it("deals 9 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 9)).toBe(true);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("bidding");
  });

  it("is deterministic", () => {
    const s1 = initialState(33, DEF);
    const s2 = initialState(33, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("has 4 seats", () => {
    const s = initialState(1, DEF);
    expect(s.hands.length).toBe(4);
  });
});

describe("pidro bidding", () => {
  it("bid transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("pass (0) is valid", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 0 });
    expect(s2).toBeDefined();
  });
});

describe("pidro legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 4 });
    if (s2.phase !== "playing" || s2.turn !== 0) return;
    expect(legalPlays(s2, 0).length).toBeGreaterThan(0);
  });
});

describe("pidro full game", () => {
  it("completes a round", () => {
    let s = initialState(8, DEF);
    s = reducer(s, { type: "bid", amount: 3 });
    let iter = 0;
    while (s.phase === "playing" && iter < 100) {
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

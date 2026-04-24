import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("bourre initialState", () => {
  it("deals 5 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 5)).toBe(true);
  });

  it("starts in fold-or-play phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("fold-or-play");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("trump card is set", () => {
    const s = initialState(1, DEF);
    expect(s.trumpCard).toBeDefined();
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });
});

describe("bourre fold", () => {
  it("folding skips player to playing or done", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "fold" });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
    expect(s2.folded[0]).toBe(true);
  });
});

describe("bourre stay", () => {
  it("staying moves to playing phase", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "stay" });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
    expect(s2.folded[0]).toBe(false);
  });

  it("legalPlays returns cards when leading", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "stay" });
    if (s1.phase === "playing" && s1.turn === 0) {
      expect(legalPlays(s1, 0).length).toBeGreaterThan(0);
    }
  });

  it("completes a full hand", () => {
    let s = initialState(7, DEF);
    s = reducer(s, { type: "stay" });
    let iter = 0;
    while (s.phase === "playing" && iter < 50) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(["done", "playing"].includes(s.phase)).toBe(true);
    if (s.phase === "done") {
      expect(isTerminal(s)).not.toBeNull();
    }
  });
});

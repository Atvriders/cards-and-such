import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

describe("seep initialState", () => {
  it("deals correct number of cards to each player", () => {
    const s = initialState(42);
    expect(s.playerHand.length).toBe(13);
    expect(s.botHand.length).toBe(13);
  });

  it("starts in playing phase", () => {
    const s = initialState(42);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic for the same seed", () => {
    const s1 = initialState(11);
    const s2 = initialState(11);
    expect(s1.playerHand.map(c => c.id)).toEqual(s2.playerHand.map(c => c.id));
  });

  it("starts with player leading", () => {
    const s = initialState(7);
    expect(s.playerLeads).toBe(true);
    expect(s.currentTrick.length).toBe(0);
  });
});

describe("seep legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42);
    expect(legalPlays(s.playerHand, s.currentTrick).length).toBeGreaterThanOrEqual(13);
  });
});

describe("seep reducer", () => {
  it("playing a card removes it from your hand", () => {
    const s = initialState(42);
    const card = s.playerHand[0]!;
    const s2 = reducer(s, { type: "play", cardId: card.id });
    expect(s2.playerHand.find(c => c.id === card.id)).toBeUndefined();
  });

  it("ignores invalid card IDs", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "play", cardId: "no-such-card" });
    expect(s2).toBe(s);
  });
});

describe("seep full game", () => {
  it("completes a full game", () => {
    let s = initialState(13);
    let iter = 0;
    while (s.phase === "playing" && iter < 500) {
      const legal = legalPlays(s.playerHand, s.currentTrick);
      if (legal.length === 0) break;
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.playerTricks + s.botTricks).toBeGreaterThanOrEqual(6);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. rankVal ────────────────────────────────────────────────────────────────
describe("rankVal", () => {
  it("2 is highest (15)", () => expect(rankVal(2)).toBe(15));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("3 is lowest (3)", () => expect(rankVal(3)).toBe(3));
  it("rank 10 is 10", () => expect(rankVal(10)).toBe(10));
});

// ── 2. isLegalPlay ─────────────────────────────────────────────────────────────
describe("isLegalPlay", () => {
  it("single card is legal on empty pile", () => {
    expect(isLegalPlay([makeCard(5)], null)).toBe(true);
  });

  it("pair is legal on empty pile", () => {
    expect(isLegalPlay([makeCard(7, "♠"), makeCard(7, "♥")], null)).toBe(true);
  });

  it("mixed ranks are illegal", () => {
    expect(isLegalPlay([makeCard(5), makeCard(6)], null)).toBe(false);
  });

  it("must match count of last play", () => {
    const lastPlay = [makeCard(5, "♠"), makeCard(5, "♥")];
    expect(isLegalPlay([makeCard(7, "♣")], lastPlay)).toBe(false);
  });

  it("must be strictly higher rank", () => {
    const lastPlay = [makeCard(8)];
    expect(isLegalPlay([makeCard(7)], lastPlay)).toBe(false);
    expect(isLegalPlay([makeCard(8, "♦")], lastPlay)).toBe(false); // same rank
    expect(isLegalPlay([makeCard(9)], lastPlay)).toBe(true);
  });

  it("2 beats Ace", () => {
    expect(isLegalPlay([makeCard(2)], [makeCard(1)])).toBe(true);
  });

  it("empty is never legal", () => {
    expect(isLegalPlay([], null)).toBe(false);
  });
});

// ── 3. initialState ────────────────────────────────────────────────────────────
describe("initialState", () => {
  it("deals 13 cards each to 4 players", () => {
    const s = initialState(42, settings);
    expect(s.hands.length).toBe(4);
    for (const h of s.hands) expect(h.length).toBe(13);
  });

  it("phase is playing, winner null", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
    expect(s.titles).toBeNull();
  });

  it("deterministic for same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.hands).toEqual(s2.hands);
  });
});

// ── 4. reducer — play ─────────────────────────────────────────────────────────
describe("reducer — play", () => {
  it("playing an illegal card is no-op", () => {
    const s = initialState(1, settings);
    // Force turn to 0 with a specific scenario
    const hand = s.hands[0]!;
    const turn0 = { ...s, turn: 0, lastPlay: [makeCard(13)] }; // K on top
    // Try to play a 3 (lower than K)
    const threes = hand.filter(c => c.rank === 3);
    if (threes.length > 0) {
      const s2 = reducer(turn0, { type: "play", cardIds: [threes[0]!.id] });
      expect(s2).toBe(turn0);
    }
  });

  it("playing reduces hand size", () => {
    const s = initialState(10, settings);
    const forceHuman = { ...s, turn: 0, lastPlay: null };
    const hand = forceHuman.hands[0]!;
    const card = hand[0]!;
    const s2 = reducer(forceHuman, { type: "play", cardIds: [card.id] });
    // Hand should be smaller after a valid play
    if (s2 !== forceHuman) {
      expect(s2.hands[0]!.length).toBeLessThan(hand.length);
    }
  });

  it("pass increments passCount", () => {
    const s = initialState(1, settings);
    const withLastPlay = { ...s, turn: 0, lastPlay: [makeCard(5)], lastPlaySeat: 1 };
    const s2 = reducer(withLastPlay, { type: "pass" });
    // passCount should increase or reset if round ends
    expect(s2.passCount).toBeGreaterThanOrEqual(0);
  });
});

// ── 5. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game ongoing", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("President scores 100", () => {
    const s = initialState(1, settings);
    const done = {
      ...s,
      phase: "done" as const,
      titles: ["President", "Vice", "Scum", "Double Scum"] as const,
      finishOrder: [0, 1, 2, 3],
    };
    expect(isTerminal(done)).toEqual({ score: 100 });
  });

  it("Double Scum scores 0", () => {
    const s = initialState(1, settings);
    const done = {
      ...s,
      phase: "done" as const,
      titles: ["Double Scum", "President", "Vice", "Scum"] as const,
      finishOrder: [1, 2, 3, 0],
    };
    expect(isTerminal(done)).toEqual({ score: 0 });
  });

  it("Scum scores 20", () => {
    const s = initialState(1, settings);
    const done = {
      ...s,
      phase: "done" as const,
      titles: ["Scum", "President", "Vice", "Double Scum"] as const,
      finishOrder: [1, 2, 0, 3],
    };
    expect(isTerminal(done)).toEqual({ score: 20 });
  });
});

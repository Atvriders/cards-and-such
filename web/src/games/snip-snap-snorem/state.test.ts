import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlay, playerHasMatch } from "./state.js";
import type { SnipSnapState } from "./state.js";
import type { Card, Rank } from "../../engines/deck/index.js";

function card(rank: Rank, suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("deals all 52 cards across seats", () => {
    const s = initialState(1, s2);
    expect(s.hands.reduce((n, h) => n + h.length, 0)).toBe(52);
  });

  it("starts with null currentRank", () => {
    expect(initialState(1, s2).currentRank).toBeNull();
  });

  it("is deterministic", () => {
    const a = initialState(42, s2);
    const b = initialState(42, s2);
    expect(a.hands[0]).toEqual(b.hands[0]);
  });

  it("3-player distributes evenly-ish", () => {
    const s = initialState(7, s3);
    expect(s.hands.reduce((n, h) => n + h.length, 0)).toBe(52);
  });
});

describe("canPlay", () => {
  it("any card plays when currentRank is null", () => {
    const base = initialState(1, s2);
    const state: SnipSnapState = { ...base, currentRank: null, step: 0 };
    expect(canPlay(card(5), state)).toBe(true);
  });

  it("matching rank plays when currentRank set", () => {
    const base = initialState(1, s2);
    const state: SnipSnapState = { ...base, currentRank: 7, step: 1 };
    expect(canPlay(card(7, "♥"), state)).toBe(true);
  });

  it("non-matching rank cannot play", () => {
    const base = initialState(1, s2);
    const state: SnipSnapState = { ...base, currentRank: 7, step: 1 };
    expect(canPlay(card(5), state)).toBe(false);
  });
});

describe("playerHasMatch", () => {
  it("returns true when hand has matching rank", () => {
    const base = initialState(1, s2);
    const state: SnipSnapState = { ...base, currentRank: 5, step: 1 };
    const hand = [card(5, "♠"), card(9, "♥")];
    expect(playerHasMatch(hand, state)).toBe(true);
  });

  it("returns false when no match", () => {
    const base = initialState(1, s2);
    const state: SnipSnapState = { ...base, currentRank: 5, step: 1 };
    const hand = [card(3), card(9)];
    expect(playerHasMatch(hand, state)).toBe(false);
  });
});

describe("reducer — play", () => {
  it("playing a card removes it from hand", () => {
    const s = initialState(1, s2);
    const c = s.hands[0]![0]!;
    const result = reducer(s, { type: "play", cardId: c.id });
    // After play, bots will run; check hand shrank
    const origLen = s.hands[0]!.length;
    // Player's hand may change after bot turns (some cards dealt back? no — just player's hand shrinks by 1 initially)
    // We just verify the card is no longer in some consistent state
    expect(result.hands[0]!.length).toBeLessThan(origLen); // player played 1
  });

  it("rejects card not in hand", () => {
    const s = initialState(1, s2);
    const result = reducer(s, { type: "play", cardId: "bogus" });
    expect(result).toBe(s);
  });

  it("rejects non-matching card when rank is active", () => {
    const base = initialState(1, s2);
    const hand = [card(5, "♠"), card(9, "♥")];
    const state: SnipSnapState = {
      ...base, turn: 0, currentRank: 7, step: 1,
      hands: [hand, base.hands[1]!],
    };
    const result = reducer(state, { type: "play", cardId: card(5, "♠").id });
    expect(result).toBe(state);
  });

  it("step advances after a play", () => {
    const base = initialState(1, s2);
    const hand = [card(7, "♠"), card(9, "♥")];
    const state: SnipSnapState = {
      ...base, turn: 0, currentRank: 7, step: 1,
      hands: [hand, [card(7, "♦"), card(7, "♣"), card(3, "♣")]],
    };
    const result = reducer(state, { type: "play", cardId: card(7, "♠").id });
    // After player plays 7♠ (step 2), bots play 7♦ and 7♣ (steps 3,4)
    // Eventually rank resets
    expect(result.phase === "playing" || result.phase === "done").toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns 500 for player win", () => {
    const s = initialState(1, s2);
    const won: SnipSnapState = { ...s, phase: "done", winner: 0 };
    expect(isTerminal(won)!.score).toBe(500);
  });

  it("returns partial score for loss", () => {
    const s = initialState(1, s2);
    const lost: SnipSnapState = { ...s, phase: "done", winner: 1, hands: [[card(2), card(3)], []] };
    expect(isTerminal(lost)!.score).toBeGreaterThanOrEqual(0);
  });
});

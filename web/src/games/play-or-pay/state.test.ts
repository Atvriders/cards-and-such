import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlayCard } from "./state.js";
import type { PlayOrPayState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const, startChips: "10" as const };
const s3 = { opponents: "2" as const, startChips: "10" as const };

describe("initialState", () => {
  it("deals all 52 cards across seats", () => {
    const s = initialState(1, s2);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });

  it("starts with correct chips", () => {
    const s = initialState(1, s2);
    expect(s.chips[0]).toBe(10);
    expect(s.chips[1]).toBe(10);
  });

  it("sequences start at 1 for all suits", () => {
    const s = initialState(1, s2);
    expect(s.sequences["♠"]).toBe(1);
    expect(s.sequences["♥"]).toBe(1);
  });

  it("is deterministic", () => {
    const a = initialState(42, s2);
    const b = initialState(42, s2);
    expect(a.hands[0]).toEqual(b.hands[0]);
  });
});

describe("canPlayCard", () => {
  const seq = { "♠": 1 as const, "♥": 3 as const, "♦": 1 as const, "♣": 1 as const };

  it("Ace of spades plays when spades sequence is at 1", () => {
    expect(canPlayCard(card(1, "♠"), seq)).toBe(true);
  });

  it("2 of spades does not play when sequence is at 1 (needs Ace first)", () => {
    expect(canPlayCard(card(2, "♠"), seq)).toBe(false);
  });

  it("3 of hearts plays when hearts sequence is at 3", () => {
    expect(canPlayCard(card(3, "♥"), seq)).toBe(true);
  });
});

describe("reducer — play", () => {
  it("playing a valid card removes it from hand", () => {
    const s = initialState(5, s2);
    // Find an Ace in the player's hand (to start a sequence)
    const ace = s.hands[0]!.find(c => c.rank === 1);
    if (!ace) return; // skip if none
    const result = reducer(s, { type: "playCard", cardId: ace.id });
    expect(result.hands[0]!.some(c => c.id === ace.id)).toBe(false);
    expect(result.sequences[ace.suit]).toBe(2);
  });

  it("rejects playing out-of-sequence card", () => {
    const s = initialState(5, s2);
    const two = s.hands[0]!.find(c => c.rank === 2 && s.sequences[c.suit] !== 2);
    if (!two) return;
    const result = reducer(s, { type: "playCard", cardId: two.id });
    // Should be unchanged if it's not the right sequence card
    if (!canPlayCard(two, s.sequences)) {
      expect(result).toBe(s);
    }
  });

  it("paying reduces chips by 1 and adds to pot", () => {
    const s = initialState(1, s2);
    const result = reducer(s, { type: "pay" });
    expect(result.chips[0]).toBe(9);
    expect(result.pot).toBeGreaterThanOrEqual(1); // player paid + bots may have paid
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns positive score for win", () => {
    const s = initialState(1, s2);
    const won: PlayOrPayState = { ...s, phase: "done", winner: 0, chips: [20, 5] };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("returns partial score for loss", () => {
    const s = initialState(1, s2);
    const lost: PlayOrPayState = { ...s, phase: "done", winner: 1, chips: [7, 18] };
    const score = isTerminal(lost)!.score;
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

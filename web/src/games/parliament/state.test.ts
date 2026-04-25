import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canPlayCard } from "./state.js";
import type { ParliamentState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("distributes all 52 cards across seats", () => {
    const s = initialState(1, s2);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });

  it("starts with empty board", () => {
    const s = initialState(1, s2);
    expect(s.board["♠"]).toBeNull();
    expect(s.board["♥"]).toBeNull();
  });

  it("is deterministic", () => {
    const a = initialState(42, s2);
    const b = initialState(42, s2);
    expect(a.hands[0]).toEqual(b.hands[0]);
  });

  it("3-player deals work evenly-ish", () => {
    const s = initialState(7, s3);
    expect(s.hands.length).toBe(3);
    const total = s.hands.reduce((n, h) => n + h.length, 0);
    expect(total).toBe(52);
  });
});

describe("canPlayCard", () => {
  it("7 can play to empty board", () => {
    const board = { "♠": null, "♥": null, "♦": null, "♣": null };
    expect(canPlayCard(card(7, "♠"), board)).toBe(true);
  });

  it("7 cannot play if suit already started", () => {
    const board = { "♠": { min: 7 as const, max: 7 as const }, "♥": null, "♦": null, "♣": null };
    expect(canPlayCard(card(7, "♠"), board)).toBe(false);
  });

  it("6 can extend from 7 downward", () => {
    const board = { "♠": { min: 7 as const, max: 7 as const }, "♥": null, "♦": null, "♣": null };
    expect(canPlayCard(card(6, "♠"), board)).toBe(true);
  });

  it("8 can extend from 7 upward", () => {
    const board = { "♠": { min: 7 as const, max: 7 as const }, "♥": null, "♦": null, "♣": null };
    expect(canPlayCard(card(8, "♠"), board)).toBe(true);
  });

  it("5 cannot extend from 7 (must be adjacent)", () => {
    const board = { "♠": { min: 7 as const, max: 7 as const }, "♥": null, "♦": null, "♣": null };
    expect(canPlayCard(card(5, "♠"), board)).toBe(false);
  });
});

describe("reducer — play", () => {
  it("player plays a 7 and board updates", () => {
    const s = initialState(1, s2);
    // Find the 7♠ in player's hand
    const seven = s.hands[0]!.find(c => c.rank === 7);
    if (!seven) return; // may not have it; skip
    const s2s = reducer(s, { type: "play", cardId: seven.id });
    expect(s2s.board[seven.suit]).not.toBeNull();
    expect(s2s.board[seven.suit]!.min).toBe(7);
    expect(s2s.board[seven.suit]!.max).toBe(7);
  });

  it("rejects playing a card not in hand", () => {
    const s = initialState(1, s2);
    const result = reducer(s, { type: "play", cardId: "bogus" });
    expect(result).toBe(s);
  });

  it("rejects invalid play (suit not started, non-7)", () => {
    const s = initialState(1, s2);
    // Find any non-7 card
    const nonSeven = s.hands[0]!.find(c => c.rank !== 7);
    if (!nonSeven) return;
    // Board is empty — only 7s valid
    const result = reducer(s, { type: "play", cardId: nonSeven.id });
    if (!canPlayCard(nonSeven, s.board)) {
      expect(result).toBe(s);
    }
  });
});

describe("reducer — pass", () => {
  it("pass is rejected when player has playable cards", () => {
    const s = initialState(1, s2);
    const hasSeven = s.hands[0]!.some(c => c.rank === 7);
    if (hasSeven) {
      const result = reducer(s, { type: "pass" });
      expect(result).toBe(s);
    }
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns 500 when player wins", () => {
    const s = initialState(1, s2);
    const won: ParliamentState = { ...s, phase: "done", winner: 0 };
    expect(isTerminal(won)!.score).toBe(500);
  });

  it("returns partial score for loss", () => {
    const s = initialState(1, s2);
    const lost: ParliamentState = { ...s, phase: "done", winner: 1, hands: [[card(2), card(3)], []] };
    const score = isTerminal(lost)!.score;
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

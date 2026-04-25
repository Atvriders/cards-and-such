import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PalaceState } from "./state.js";

const s2 = { opponents: "1" as const };
const s3 = { opponents: "2" as const };

describe("initialState", () => {
  it("deals 3 hand + 3 up + 3 down per player", () => {
    const s = initialState(1, s2);
    expect(s.players[0]!.hand.length).toBe(3);
    expect(s.players[0]!.tableUp.length).toBe(3);
    expect(s.players[0]!.tableDown.length).toBe(3);
  });

  it("draw pile has remaining cards", () => {
    const s = initialState(1, s2);
    // 2 players × 9 cards = 18, remaining = 34
    expect(s.drawPile.length).toBe(52 - 18);
  });

  it("is deterministic", () => {
    const a = initialState(42, s2);
    const b = initialState(42, s2);
    expect(a.players[0]!.hand).toEqual(b.players[0]!.hand);
  });

  it("starts with empty discard pile", () => {
    const s = initialState(5, s2);
    expect(s.discardPile.length).toBe(0);
  });
});

describe("reducer — play cards", () => {
  it("player can play any card to empty pile", () => {
    const s = initialState(7, s2);
    const card = s.players[0]!.hand[0]!;
    const s2s = reducer(s, { type: "playCards", cardIds: [card.id] });
    expect(s2s.discardPile.length).toBeGreaterThan(0);
    expect(s2s.players[0]!.hand.includes(card)).toBe(false);
  });

  it("pick up pile adds pile cards to hand", () => {
    const base = initialState(5, s2);
    const card = base.players[0]!.hand[0]!;
    // Create a 1-seat fake so bots don't run and mess with discard
    const fakeState: PalaceState = { ...base, seats: 1, players: [base.players[0]!], turn: 0, discardPile: [card] };
    const result = reducer(fakeState, { type: "pickUpPile" });
    // Hand should contain the pile card, discard should be empty
    expect(result.players[0]!.hand.some(c => c.id === card.id)).toBe(true);
    expect(result.discardPile.length).toBe(0);
  });

  it("rejects play when not player turn", () => {
    const s = initialState(1, s2);
    const card = s.players[0]!.hand[0]!;
    const fakeState: PalaceState = { ...s, turn: 1 };
    const result = reducer(fakeState, { type: "playCards", cardIds: [card.id] });
    expect(result).toBe(fakeState);
  });

  it("10 burns the discard pile (single seat test)", () => {
    const base = initialState(5, s2);
    const tenCard = { rank: 10 as const, suit: "♠" as const, id: "ten" };
    const fakeHand = [tenCard];
    const fakeState: PalaceState = {
      ...base,
      seats: 1,
      turn: 0,
      players: [{ ...base.players[0]!, hand: fakeHand, tableUp: [], tableDown: [] }],
      discardPile: [{ rank: 5, suit: "♠", id: "five" }],
    };
    const result = reducer(fakeState, { type: "playCards", cardIds: [tenCard.id] });
    // After playing 10, pile burned — either done (hand empty) or discard empty
    expect(result.discardPile.length === 0 || result.winner !== null).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("returns 500 when player wins", () => {
    const s = initialState(1, s2);
    const won: PalaceState = { ...s, phase: "done", winner: 0 };
    expect(isTerminal(won)!.score).toBe(500);
  });

  it("returns 50 when player loses", () => {
    const s = initialState(1, s2);
    const lost: PalaceState = { ...s, phase: "done", winner: 1 };
    expect(isTerminal(lost)!.score).toBe(50);
  });
});

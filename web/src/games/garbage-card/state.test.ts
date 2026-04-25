import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, slotForRank, isWild, isGarbage } from "./state.js";
import type { GarbageState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function card(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

const settings = { rounds: "3" as const };

describe("initialState", () => {
  it("starts with 10 empty slots for each player", () => {
    const s = initialState(1, settings);
    expect(s.playerSlots.every(sl => sl === null)).toBe(true);
    expect(s.botSlots.every(sl => sl === null)).toBe(true);
  });

  it("draw pile has all 52 cards", () => {
    const s = initialState(1, settings);
    expect(s.drawPile.length).toBe(52);
  });

  it("starts in playerTurn phase", () => {
    expect(initialState(1, settings).phase).toBe("playerTurn");
  });

  it("is deterministic", () => {
    const a = initialState(99, settings);
    const b = initialState(99, settings);
    expect(a.drawPile[0]).toEqual(b.drawPile[0]);
  });
});

describe("slotForRank / isWild / isGarbage", () => {
  it("rank 1 goes to slot 0", () => { expect(slotForRank(1)).toBe(0); });
  it("rank 10 goes to slot 9", () => { expect(slotForRank(10)).toBe(9); });
  it("Jack (11) is wild", () => { expect(isWild(11)).toBe(true); });
  it("Queen (12) is garbage", () => { expect(isGarbage(12)).toBe(true); });
  it("King (13) is garbage", () => { expect(isGarbage(13)).toBe(true); });
});

describe("reducer — draw", () => {
  it("drawing sets currentCard", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.currentCard).not.toBeNull();
    expect(s2.drawPile.length).toBe(51);
  });

  it("cannot draw twice in a row", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "draw" });
    const s3 = reducer(s2, { type: "draw" });
    expect(s3.currentCard).toBe(s2.currentCard);
  });
});

describe("reducer — placeCard", () => {
  it("placing Ace in slot 0 fills that slot", () => {
    const base = initialState(1, settings);
    const ace = card(1);
    const s: GarbageState = { ...base, phase: "playerTurn", currentCard: ace };
    const result = reducer(s, { type: "placeCard", slot: 0 });
    expect(result.playerSlots[0]).toEqual(ace);
  });

  it("placing in wrong slot is rejected", () => {
    const base = initialState(1, settings);
    const five = card(5);
    const s: GarbageState = { ...base, phase: "playerTurn", currentCard: five };
    const result = reducer(s, { type: "placeCard", slot: 3 }); // slot 4, not 5
    expect(result).toBe(s);
  });

  it("discard removes garbage card and passes turn to bot", () => {
    const base = initialState(1, settings);
    const queen = card(12);
    const s: GarbageState = { ...base, phase: "playerTurn", currentCard: queen };
    const result = reducer(s, { type: "discard" });
    expect(result.discardPile.some(c => c.id === queen.id)).toBe(true);
    expect(result.currentCard).toBeNull();
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score for player win", () => {
    const s = initialState(1, settings);
    const won: GarbageState = { ...s, phase: "done", winner: 0, roundsWon: [2, 1] };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("returns partial score for player loss", () => {
    const s = initialState(1, settings);
    const lost: GarbageState = { ...s, phase: "done", winner: 1, roundsWon: [1, 2] };
    expect(isTerminal(lost)!.score).toBeGreaterThanOrEqual(0);
  });
});

import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { dummy: true };

describe("Fifteens initialState", () => {
  it("starts with 3 face-up cards and 49 in deck", () => {
    const s = initialState(1, settings);
    const faceUpCount = s.faceUp.filter(Boolean).length;
    expect(faceUpCount).toBe(3);
    expect(s.deck.length).toBe(49);
    expect(s.phase).toBe("playing");
    expect(s.moves).toBe(0);
  });

  it("is deterministic for the same seed", () => {
    expect(initialState(7, settings)).toEqual(initialState(7, settings));
  });
});

describe("Fifteens toggleSelect", () => {
  it("selects a card", () => {
    const s = initialState(42, settings);
    const card = s.faceUp.find(Boolean)!;
    const s2 = reducer(s, { type: "toggleSelect", cardId: card.id });
    expect(s2.selected).toContain(card.id);
  });

  it("deselects a previously selected card", () => {
    const s = initialState(42, settings);
    const card = s.faceUp.find(Boolean)!;
    const s2 = reducer(s, { type: "toggleSelect", cardId: card.id });
    const s3 = reducer(s2, { type: "toggleSelect", cardId: card.id });
    expect(s3.selected).not.toContain(card.id);
  });
});

describe("Fifteens remove", () => {
  it("does not remove cards if sum != 15", () => {
    const s = initialState(1, settings);
    const card = s.faceUp.find(Boolean)!;
    const s2 = reducer(s, { type: "toggleSelect", cardId: card.id });
    const s3 = reducer(s2, { type: "remove" });
    // Only valid if card happens to be a 15, which doesn't exist, so state unchanged
    expect(s3.moves).toBe(0);
  });

  it("removes valid selection summing to 15", () => {
    // Build a state where we know 2 cards sum to 15
    const s = initialState(1, settings);
    // Insert two known cards summing to 15 into faceUp
    const c1 = { rank: "9" as const, suit: "♠" as const, id: 100 };
    const c2 = { rank: "6" as const, suit: "♥" as const, id: 101 };
    const manualState = { ...s, faceUp: [c1, c2, null] as (typeof c1 | typeof c2 | null)[], selected: [100, 101] };
    const s2 = reducer(manualState, { type: "remove" });
    expect(s2.moves).toBe(1);
    const remaining = s2.faceUp.filter((c): c is NonNullable<typeof c> => c !== null);
    expect(remaining.some((c) => c.id === 100 || c.id === 101)).toBe(false);
  });
});

describe("Fifteens terminal", () => {
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns positive score when won", () => {
    const s = initialState(1, settings);
    const won = { ...s, phase: "won" as const, moves: 10 };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });

  it("isTerminal returns 0 score when lost", () => {
    const s = initialState(1, settings);
    const lost = { ...s, phase: "lost" as const };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});

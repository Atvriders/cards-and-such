import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { dummy: true };

describe("NapoleonsTomb initialState", () => {
  it("starts with 51 cards in deck, one current card, empty grid", () => {
    const s = initialState(1, settings);
    expect(s.deck.length).toBe(51);
    expect(s.currentCard).not.toBeNull();
    expect(s.grid.filter(Boolean).length).toBe(0);
    expect(s.foundations.every((p) => p.length === 0)).toBe(true);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic for the same seed", () => {
    expect(initialState(99, settings)).toEqual(initialState(99, settings));
  });
});

describe("NapoleonsTomb placeGrid", () => {
  it("places current card into empty grid cell", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "placeGrid", cell: 0 });
    expect(s2.grid[0]).not.toBeNull();
    expect(s2.moves).toBe(1);
    // A new card should be drawn
    expect(s2.currentCard).not.toEqual(s.currentCard);
  });

  it("does not place into occupied cell", () => {
    const s = initialState(5, settings);
    const s2 = reducer(s, { type: "placeGrid", cell: 0 });
    const s3 = reducer(s2, { type: "placeGrid", cell: 0 });
    expect(s3.grid[0]).toEqual(s2.grid[0]); // unchanged
  });
});

describe("NapoleonsTomb placeFoundation", () => {
  it("places Ace directly onto matching foundation", () => {
    const s = initialState(1, settings);
    // Create a state with an Ace as current card
    const aceCard = { rank: "A" as const, suit: "♠" as const, id: 200 };
    const manualState = { ...s, currentCard: aceCard };
    const s2 = reducer(manualState, { type: "placeFoundation", suit: "♠" });
    expect(s2.foundations[0]!.length).toBe(1);
    expect(s2.foundations[0]![0]!.rank).toBe("A");
    expect(s2.moves).toBe(1);
  });

  it("rejects non-Ace on empty foundation", () => {
    const s = initialState(1, settings);
    const twoCard = { rank: "2" as const, suit: "♠" as const, id: 201 };
    const manualState = { ...s, currentCard: twoCard };
    const s2 = reducer(manualState, { type: "placeFoundation", suit: "♠" });
    expect(s2.foundations[0]!.length).toBe(0);
    expect(s2.moves).toBe(0);
  });
});

describe("NapoleonsTomb terminal", () => {
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("isTerminal returns positive score when won", () => {
    const s = initialState(1, settings);
    const won = { ...s, phase: "won" as const, moves: 52 };
    expect(isTerminal(won)!.score).toBeGreaterThan(0);
  });
});

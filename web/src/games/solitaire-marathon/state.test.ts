import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SolitaireMarathonSettings } from "./state.js";

const settings: SolitaireMarathonSettings = { rounds: "3" };

describe("SolitaireMarathon initialState", () => {
  it("starts at round 1 with empty pile", () => {
    const s = initialState(1, settings);
    expect(s.round).toBe(1);
    expect(s.pile).toHaveLength(0);
    expect(s.gameOver).toBe(false);
  });

  it("deck has 52 cards", () => {
    const s = initialState(1, settings);
    expect(s.deck).toHaveLength(52);
  });

  it("all ranks 1-13 appear 4 times in deck", () => {
    const s = initialState(1, settings);
    for (let rank = 1; rank <= 13; rank++) {
      const count = s.deck.filter(c => c.rank === rank).length;
      expect(count).toBe(4);
    }
  });
});

describe("SolitaireMarathon reducer", () => {
  it("draw adds a card to the pile", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.pile).toHaveLength(1);
    expect(s2.deckIdx).toBe(1);
  });

  it("collect removes top two matching cards", () => {
    // Force a state with two matching cards on pile
    const s = initialState(1, settings);
    const card1 = { suit: "♠" as const, rank: 5 };
    const card2 = { suit: "♠" as const, rank: 9 };
    const s2 = { ...s, pile: [card1, card2] };
    const s3 = reducer(s2, { type: "collect" });
    expect(s3.pile).toHaveLength(0);
    expect(s3.collected).toBe(2);
  });

  it("collect does nothing when top two don't match", () => {
    const s = initialState(1, settings);
    const card1 = { suit: "♠" as const, rank: 5 };
    const card2 = { suit: "♥" as const, rank: 9 };
    const s2 = { ...s, pile: [card1, card2] };
    const s3 = reducer(s2, { type: "collect" });
    expect(s3.pile).toHaveLength(2);
    expect(s3.collected).toBe(0);
  });

  it("drawing all 52 cards sets roundOver", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 52; i++) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.roundOver).toBe(true);
  });

  it("nextRound advances to next round", () => {
    let s = initialState(1, settings);
    // exhaust the deck
    for (let i = 0; i < 52; i++) s = reducer(s, { type: "draw" });
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.round).toBe(2);
    expect(s2.roundOver).toBe(false);
  });

  it("restart resets to round 1", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "draw" });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.round).toBe(1);
    expect(s2.pile).toHaveLength(0);
  });
});

describe("SolitaireMarathon isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, settings), gameOver: true, totalCollected: 20 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});

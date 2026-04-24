import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("FortuneTeller", () => {
  it("starts with correct deck size and no drawn cards", () => {
    const s = initialState(42, { deckSize: "32" });
    expect(s.deck).toHaveLength(32);
    expect(s.drawnCards).toHaveLength(0);
    expect(s.currentCard).toBeNull();
    expect(s.cardsRemaining).toBe(32);
    expect(s.gameOver).toBe(false);
  });

  it("drawing a card reveals it and reduces remaining count", () => {
    const s0 = initialState(42, { deckSize: "32" });
    const s1 = reducer(s0, { type: "draw" });
    expect(s1.drawnCards).toHaveLength(1);
    expect(s1.currentCard).not.toBeNull();
    expect(s1.cardsRemaining).toBe(31);
    expect(s1.currentCard?.fortune).toBeTruthy();
  });

  it("drawing all cards ends the game", () => {
    let s = initialState(7, { deckSize: "16" });
    for (let i = 0; i < 16; i++) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.drawnCards).toHaveLength(16);
    expect(s.cardsRemaining).toBe(0);
  });

  it("isTerminal returns score equal to cards drawn * 10", () => {
    let s = initialState(99, { deckSize: "16" });
    for (let i = 0; i < 16; i++) {
      s = reducer(s, { type: "draw" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(160);
  });

  it("reset action creates a fresh game", () => {
    let s = initialState(1, { deckSize: "32" });
    s = reducer(s, { type: "draw" });
    s = reducer(s, { type: "draw" });
    const reset = reducer(s, { type: "reset" });
    expect(reset.drawnCards).toHaveLength(0);
    expect(reset.currentCard).toBeNull();
    expect(reset.gameOver).toBe(false);
    expect(reset.deck).toHaveLength(32);
  });

  it("each card has a unique fortune assigned", () => {
    const s = initialState(0, { deckSize: "32" });
    const fortuneSet = new Set(s.deck.map(c => c.fortune));
    // With 32 fortunes and 32 cards, all fortunes should be unique
    expect(fortuneSet.size).toBe(32);
  });

  it("no draws allowed after game over", () => {
    let s = initialState(5, { deckSize: "16" });
    for (let i = 0; i < 16; i++) s = reducer(s, { type: "draw" });
    const count = s.drawnCards.length;
    s = reducer(s, { type: "draw" });
    expect(s.drawnCards.length).toBe(count);
  });
});

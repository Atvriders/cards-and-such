import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Clock initialState", () => {
  it("has exactly 52 cards across 13 piles", () => {
    const s = initialState(42, settings);
    expect(s.piles.length).toBe(13);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("each pile has exactly 4 cards", () => {
    const s = initialState(42, settings);
    for (const pile of s.piles) {
      expect(pile.cards.length).toBe(4);
      expect(pile.faceUpCount).toBe(0);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    for (let i = 0; i < 13; i++) {
      const ids1 = s1.piles[i]!.cards.map((c) => c.id);
      const ids2 = s2.piles[i]!.cards.map((c) => c.id);
      expect(ids1).toEqual(ids2);
    }
  });

  it("starts from center pile (index 12)", () => {
    const s = initialState(42, settings);
    expect(s.currentPileIndex).toBe(12);
  });
});

describe("Clock reducer — flip", () => {
  it("flip reveals top face-down card and increments faceUpCount", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "flip" });
    expect(next.piles[12]!.faceUpCount).toBe(1);
    expect(next.movesMade).toBe(1);
    expect(next.score).toBe(1);
  });

  it("flip moves to correct pile based on flipped card rank", () => {
    const s = initialState(42, settings);
    const centerPile = s.piles[12]!;
    const topCard = centerPile.cards[centerPile.cards.length - 1]!;
    // rank → pile index: A=0, 2=1, ..., Q=11, K=12
    const expectedIndex = topCard.rank === 1 ? 0 : topCard.rank === 13 ? 12 : (topCard.rank as number) - 1;
    const next = reducer(s, { type: "flip" });
    expect(next.currentPileIndex).toBe(expectedIndex);
  });

  it("multiple flips keep total card count at 52", () => {
    // Cards don't move, only faceUpCount changes
    const s = initialState(42, settings);
    let cur = s;
    for (let i = 0; i < 10; i++) {
      cur = reducer(cur, { type: "flip" });
    }
    const total = cur.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("won=false and gameOver=false on initial state", () => {
    const s = initialState(42, settings);
    expect(s.won).toBe(false);
    expect(s.gameOver).toBe(false);
  });
});

describe("Clock isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score=0 when gameOver", () => {
    const s = initialState(42, settings);
    const gameOverState = { ...s, gameOver: true, won: false };
    const result = isTerminal(gameOverState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
  });

  it("returns positive score when won", () => {
    const s = initialState(42, settings);
    const wonState = { ...s, won: true, score: 51 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(51);
  });
});

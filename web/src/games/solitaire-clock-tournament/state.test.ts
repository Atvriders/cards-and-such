import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("SolitaryClock initialState", () => {
  it("deals 52 cards into 13 piles of 4", () => {
    const s = initialState(42);
    expect(s.piles).toHaveLength(13);
    for (const pile of s.piles) {
      expect(pile).toHaveLength(4);
    }
    expect(s.gameOver).toBe(false);
    expect(s.currentPile).toBe(12);
  });

  it("all cards are face down at start", () => {
    const s = initialState(1);
    expect(s.piles.flat().every((c) => !c.faceUp)).toBe(true);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("SolitaryClock flip", () => {
  it("flips a card and changes currentPile", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "flip" });
    expect(s2.moves).toBe(1);
    // At least one card is now face up
    expect(s2.piles.flat().some((c) => c.faceUp)).toBe(true);
  });

  it("is deterministic", () => {
    const s = initialState(1);
    const a = reducer(s, { type: "flip" });
    const b = reducer(s, { type: "flip" });
    expect(a.moves).toEqual(b.moves);
    expect(a.currentPile).toEqual(b.currentPile);
  });

  it("eventually ends the game", () => {
    let s = initialState(42);
    let safety = 200;
    while (!s.gameOver && safety-- > 0) {
      s = reducer(s, { type: "flip" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.won || s.lost).toBe(true);
  });
});

describe("SolitaryClock isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(5))).toBeNull();
  });

  it("returns score 0 on loss", () => {
    const s = { ...initialState(1), gameOver: true, lost: true, won: false };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("returns positive score on win", () => {
    const s = { ...initialState(1), gameOver: true, won: true, lost: false, moves: 48 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});

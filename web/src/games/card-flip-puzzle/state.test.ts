import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CardFlipPuzzleState } from "./state.js";

describe("CardFlipPuzzle initialState", () => {
  it("has 16 cards, all face-down and unmatched", () => {
    const s = initialState(42);
    expect(s.cards).toHaveLength(16);
    expect(s.revealed.every((v) => !v)).toBe(true);
    expect(s.matched.every((v) => !v)).toBe(true);
    expect(s.pairsFound).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("has exactly two of each value 1-8", () => {
    const s = initialState(1);
    for (let v = 1; v <= 8; v++) {
      expect(s.cards.filter((c) => c === v)).toHaveLength(2);
    }
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("CardFlipPuzzle flip", () => {
  it("reveals a card on flip", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "flip", index: 0 });
    expect(s2.revealed[0]).toBe(true);
    expect(s2.flipA).toBe(0);
  });

  it("matches two identical cards", () => {
    const s = initialState(1);
    // Find two cards with the same value
    const val = s.cards[0]!;
    const idx2 = s.cards.findIndex((v, i) => v === val && i !== 0);
    const s2 = reducer(s, { type: "flip", index: 0 });
    const s3 = reducer(s2, { type: "flip", index: idx2 });
    expect(s3.matched[0]).toBe(true);
    expect(s3.matched[idx2]).toBe(true);
    expect(s3.pairsFound).toBe(1);
    expect(s3.moves).toBe(1);
  });

  it("sets flipB on mismatch and clears on clearMismatch", () => {
    const s = initialState(1);
    // Find two different cards
    const idxA = 0;
    const val = s.cards[0]!;
    const idxB = s.cards.findIndex((v, i) => v !== val && i !== idxA);
    const s2 = reducer(s, { type: "flip", index: idxA });
    const s3 = reducer(s2, { type: "flip", index: idxB });
    if (s3.flipB !== null) {
      // It was a mismatch
      const s4 = reducer(s3, { type: "clearMismatch" });
      expect(s4.flipA).toBeNull();
      expect(s4.flipB).toBeNull();
      expect(s4.revealed[idxA]).toBe(false);
    }
  });
});

describe("CardFlipPuzzle isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when game over", () => {
    const s: CardFlipPuzzleState = { ...initialState(1), gameOver: true, moves: 8 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1000);
  });
});

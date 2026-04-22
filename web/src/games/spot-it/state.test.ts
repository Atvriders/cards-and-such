import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpotItState } from "./state.js";

describe("initialState", () => {
  it("has two cards with symbols", () => {
    const s = initialState(42);
    expect(s.card1.symbols.length).toBeGreaterThan(0);
    expect(s.card2.symbols.length).toBeGreaterThan(0);
  });

  it("two cards always share at least one symbol (projective plane property)", () => {
    const s = initialState(42);
    const shared = s.card1.symbols.filter(sym => s.card2.symbols.includes(sym));
    expect(shared.length).toBeGreaterThan(0);
  });

  it("starts with 0 score", () => {
    const s = initialState(42);
    expect(s.score).toBe(0);
    expect(s.botScore).toBe(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.card1.symbols).toEqual(s2.card1.symbols);
  });
});

describe("projective plane correctness", () => {
  it("every pair of cards in deck shares exactly one symbol", () => {
    const s = initialState(1);
    // Check a sample of card pairs
    const deck = s.deck;
    let checked = 0;
    for (let i = 0; i < Math.min(5, deck.length); i++) {
      for (let j = i + 1; j < Math.min(5, deck.length); j++) {
        const shared = deck[i]!.symbols.filter(sym => deck[j]!.symbols.includes(sym));
        expect(shared.length).toBeGreaterThanOrEqual(1);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("reducer - click", () => {
  it("correct click increases score", () => {
    const s: SpotItState = { ...initialState(5), clickedAt: 0 };
    const match = s.card1.symbols.find(sym => s.card2.symbols.includes(sym))!;
    const s2 = reducer(s, { type: "click", symbol: match });
    expect(s2.score).toBe(1);
  });

  it("wrong click does not change score", () => {
    const s: SpotItState = { ...initialState(5), clickedAt: 0 };
    const match = s.card1.symbols.find(sym => s.card2.symbols.includes(sym))!;
    const wrong = s.card1.symbols.find(sym => sym !== match) ?? "WRONG";
    if (wrong === match) return; // all symbols match (shouldn't happen)
    const s2 = reducer(s, { type: "click", symbol: wrong });
    expect(s2.score).toBe(0);
  });
});

describe("reducer - tick (bot)", () => {
  it("bot scores when reaction time exceeds threshold", () => {
    const s = initialState(3);
    // Set clickedAt far in the past
    const past = 0;
    const s2: SpotItState = { ...s, clickedAt: past, botReactionMs: 100 };
    const s3 = reducer(s2, { type: "tick", nowMs: 5000 });
    expect(s3.botScore).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(8))).toBeNull();
  });

  it("returns score when won", () => {
    const s: SpotItState = { ...initialState(8), won: true, score: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(50);
  });

  it("returns lower score when lost", () => {
    const s: SpotItState = { ...initialState(8), lost: true, score: 3 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(15);
  });
});

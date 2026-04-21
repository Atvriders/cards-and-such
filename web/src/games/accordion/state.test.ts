import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves } from "./state.js";
import type { AccordionSettings } from "./state.js";

const defaultSettings: AccordionSettings = { allowJump3: true };

describe("Accordion initialState", () => {
  it("starts with 52 piles of 1 card each", () => {
    const s = initialState(42, defaultSettings);
    expect(s.piles.length).toBe(52);
    for (const pile of s.piles) expect(pile.length).toBe(1);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    const ids1 = s1.piles.flat().map((c) => c.id).join(",");
    const ids2 = s2.piles.flat().map((c) => c.id).join(",");
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    const ids1 = s1.piles.flat().map((c) => c.id).join(",");
    const ids2 = s2.piles.flat().map((c) => c.id).join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("all 52 unique card ids across piles", () => {
    const s = initialState(5, defaultSettings);
    const allIds = s.piles.flat().map((c) => c.id);
    const unique = new Set(allIds);
    expect(unique.size).toBe(52);
  });
});

describe("Accordion reducer — move", () => {
  it("merges source pile into destination and compacts", () => {
    const s = initialState(42, defaultSettings);
    // Force a legal move if one exists at start
    const moves = legalMoves(s.piles, true);
    if (moves.length === 0) return; // edge case, skip
    const m = moves[0]!;
    const prevLen = s.piles.length;
    const next = reducer(s, { type: "move", fromIndex: m.from, toIndex: m.to });
    expect(next.piles.length).toBe(prevLen - 1);
    expect(next.movesMade).toBe(1);
  });

  it("illegal move (wrong offset) does not change state", () => {
    const s = initialState(42, defaultSettings);
    // Move from index 0 to index 0 — same pile, illegal
    const next = reducer(s, { type: "move", fromIndex: 0, toIndex: 0 });
    expect(next.piles.length).toBe(s.piles.length);
    expect(next.movesMade).toBe(0);
  });

  it("non-matching cards cannot be merged", () => {
    const s = initialState(42, defaultSettings);
    // Find the first pair that definitely doesn't match
    let tested = false;
    for (let i = 1; i < s.piles.length; i++) {
      const topI = s.piles[i]![0]!;
      const topPrev = s.piles[i - 1]![0]!;
      if (topI.suit !== topPrev.suit && topI.rank !== topPrev.rank) {
        const next = reducer(s, { type: "move", fromIndex: i, toIndex: i - 1 });
        // Should NOT merge since they don't match
        expect(next.piles.length).toBe(s.piles.length);
        tested = true;
        break;
      }
    }
    // If all adjacent cards happen to match, skip assertion
    if (!tested) expect(true).toBe(true);
  });

  it("won flag is set when single pile remains", () => {
    // Construct minimal state: 2 matching piles
    const { Card: _Card, ..._ } = {} as Record<string, unknown>;
    void _Card; void _;
    const s = initialState(42, defaultSettings);
    // Manually force a 2-pile winning state
    const c0 = s.piles[0]![0]!;
    const c1 = { ...c0, id: "dup" }; // same suit/rank → will match
    const twoState = {
      ...s,
      piles: [[c0], [c1]],
    };
    const next = reducer(twoState, { type: "move", fromIndex: 1, toIndex: 0 });
    expect(next.won).toBe(true);
    expect(next.piles.length).toBe(1);
  });
});

describe("Accordion isTerminal", () => {
  it("returns null when game is in progress with moves available", () => {
    const s = initialState(42, defaultSettings);
    const moves = legalMoves(s.piles, true);
    if (moves.length > 0) {
      expect(isTerminal(s)).toBeNull();
    } else {
      expect(isTerminal(s)).not.toBeNull();
    }
  });

  it("returns score when won", () => {
    const s = initialState(42, defaultSettings);
    const c = s.piles[0]![0]!;
    const won = { ...s, won: true, piles: [[c]], score: 100 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });
});

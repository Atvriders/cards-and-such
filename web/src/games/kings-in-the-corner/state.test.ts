import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalPlays } from "./state.js";

describe("KingsInTheCorner initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("each player starts with 7 cards", () => {
    const s = initialState(42, {});
    for (let i = 0; i < 4; i++) {
      expect(s.piles.find((p) => p.id === `h${i}`)!.cards.length).toBe(7);
    }
  });

  it("4 tableau piles start with 1 card each", () => {
    const s = initialState(42, {});
    const tabs = ["tN", "tS", "tE", "tW"].map((id) => s.piles.find((p) => p.id === id)!);
    for (const t of tabs) expect(t.cards.length).toBe(1);
  });

  it("4 corner piles start empty", () => {
    const s = initialState(42, {});
    const corners = ["cNW", "cNE", "cSE", "cSW"].map((id) => s.piles.find((p) => p.id === id)!);
    for (const c of corners) expect(c.cards.length).toBe(0);
  });
});

describe("KingsInTheCorner reducer — draw", () => {
  it("draw adds card to player 0 hand and increments drawn flag", () => {
    const s = initialState(42, {});
    const before = s.piles.find((p) => p.id === "h0")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "h0")!.cards.length).toBe(before + 1);
    expect(next.drawnThisTurn).toBe(true);
  });

  it("cannot draw twice in one turn", () => {
    const s = initialState(42, {});
    const s1 = reducer(s, { type: "draw" });
    const s2 = reducer(s1, { type: "draw" });
    expect(s2.piles.find((p) => p.id === "h0")!.cards.length)
      .toBe(s1.piles.find((p) => p.id === "h0")!.cards.length);
  });

  it("end-turn advances to next player", () => {
    const s = initialState(42, {});
    const s1 = reducer(s, { type: "draw" });
    const s2 = reducer(s1, { type: "end-turn" });
    expect(s2.currentPlayer).toBe(1);
    expect(s2.drawnThisTurn).toBe(false);
  });

  it("getLegalPlays returns array (may be empty or non-empty)", () => {
    const s = initialState(42, {});
    const plays = getLegalPlays(s);
    expect(Array.isArray(plays)).toBe(true);
  });
});

describe("KingsInTheCorner isTerminal", () => {
  it("returns null at start", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 100 when player 0 hand is empty and moves made > 0", () => {
    const s = initialState(42, {});
    // Manually empty h0
    const fakePiles = s.piles.map((p) => p.id === "h0" ? { ...p, cards: [] } : p);
    const won = { ...s, piles: fakePiles, movesMade: 5 };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });
});

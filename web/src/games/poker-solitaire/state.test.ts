import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, classifyHand, HAND_SCORES } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = {};

function mkCard(rank: number, suit: string, id: string): Card {
  return { rank: rank as any, suit: suit as any, id };
}

describe("classifyHand", () => {
  it("identifies a flush", () => {
    const hand = [mkCard(2, "♠", "a"), mkCard(5, "♠", "b"), mkCard(7, "♠", "c"), mkCard(9, "♠", "d"), mkCard(11, "♠", "e")];
    expect(classifyHand(hand)).toBe("flush");
  });

  it("identifies a straight", () => {
    const hand = [mkCard(5, "♠", "a"), mkCard(6, "♥", "b"), mkCard(7, "♦", "c"), mkCard(8, "♣", "d"), mkCard(9, "♠", "e")];
    expect(classifyHand(hand)).toBe("straight");
  });

  it("identifies four of a kind", () => {
    const hand = [mkCard(7, "♠", "a"), mkCard(7, "♥", "b"), mkCard(7, "♦", "c"), mkCard(7, "♣", "d"), mkCard(2, "♠", "e")];
    expect(classifyHand(hand)).toBe("four-of-a-kind");
  });

  it("identifies full house", () => {
    const hand = [mkCard(3, "♠", "a"), mkCard(3, "♥", "b"), mkCard(3, "♦", "c"), mkCard(6, "♣", "d"), mkCard(6, "♠", "e")];
    expect(classifyHand(hand)).toBe("full-house");
  });

  it("identifies two pair", () => {
    const hand = [mkCard(4, "♠", "a"), mkCard(4, "♥", "b"), mkCard(8, "♦", "c"), mkCard(8, "♣", "d"), mkCard(2, "♠", "e")];
    expect(classifyHand(hand)).toBe("two-pair");
  });

  it("identifies pair", () => {
    const hand = [mkCard(10, "♠", "a"), mkCard(10, "♥", "b"), mkCard(3, "♦", "c"), mkCard(7, "♣", "d"), mkCard(9, "♠", "e")];
    expect(classifyHand(hand)).toBe("pair");
  });
});

describe("PokerSolitaire initialState", () => {
  it("grid starts all null", () => {
    const s = initialState(42, settings);
    for (const row of s.grid) for (const cell of row) expect(cell).toBeNull();
  });

  it("has a current card and 24 remaining", () => {
    const s = initialState(42, settings);
    expect(s.currentCard).not.toBeNull();
    expect(s.drawPile.length).toBe(24);
  });

  it("is deterministic", () => {
    const s1 = initialState(3, settings);
    const s2 = initialState(3, settings);
    expect(s1.currentCard!.id).toBe(s2.currentCard!.id);
    expect(s1.drawPile.map((c) => c.id).join(",")).toBe(s2.drawPile.map((c) => c.id).join(","));
  });
});

describe("PokerSolitaire reducer", () => {
  it("placing a card fills the grid cell", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "place", row: 0, col: 0 });
    expect(next.grid[0]![0]).not.toBeNull();
    expect(next.movesMade).toBe(1);
  });

  it("cannot place on an occupied cell", () => {
    const s = initialState(42, settings);
    const s1 = reducer(s, { type: "place", row: 0, col: 0 });
    const s2 = reducer(s1, { type: "place", row: 0, col: 0 });
    // s2's grid[0][0] should remain the first card
    expect(s2.grid[0]![0]!.id).toBe(s1.grid[0]![0]!.id);
  });

  it("game is won after 25 placements", () => {
    let s = initialState(42, settings);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        s = reducer(s, { type: "place", row: r, col: c });
      }
    }
    expect(s.won).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });

  it("HAND_SCORES has royal-flush at 30", () => {
    expect(HAND_SCORES["royal-flush"]).toBe(30);
    expect(HAND_SCORES["pair"]).toBe(1);
    expect(HAND_SCORES["high-card"]).toBe(0);
  });
});

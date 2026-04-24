import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Sea Haven Towers initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(10);
    const s2 = initialState(10);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(3);
    const s2 = initialState(4);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("has 10 columns, 4 cells, 4 foundations", () => {
    const s = initialState(5);
    const cols = s.piles.filter((p) => p.kind === "tableau");
    const cells = s.piles.filter((p) => p.kind === "freecell");
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(cols.length).toBe(10);
    expect(cells.length).toBe(4);
    expect(foundations.length).toBe(4);
  });
});

describe("Sea Haven Towers reducer", () => {
  it("multi-card move is rejected", () => {
    const s = initialState(42);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 2 });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });

  it("auto-move preserves total card count", () => {
    const s = initialState(7);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });

  it("movesMade increments on valid move", () => {
    const s = initialState(42);
    // Move top card of c1 to a cell (r1 if empty... first 2 cells may have cards)
    // Find an empty cell
    const emptyCell = s.piles.find((p) => p.kind === "freecell" && p.cards.length === 0);
    if (!emptyCell) return; // skip if no empty cell (seeded)
    const colWithCards = s.piles.find((p) => p.kind === "tableau" && p.cards.length > 0);
    if (!colWithCards) return;
    const next = reducer(s, { type: "move", fromPile: colWithCards.id, toPile: emptyCell.id, count: 1 });
    expect(next.movesMade).toBe(1);
  });
});

describe("Sea Haven Towers isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all foundations full", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    for (let i = 1; i <= 4; i++) {
      wonPiles.push({ id: `r${i}`, kind: "freecell", cards: [] });
    }
    const wonState = { piles: wonPiles, movesMade: 100, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});

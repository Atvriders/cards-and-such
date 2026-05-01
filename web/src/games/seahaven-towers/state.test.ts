import { describe, it, expect } from "vitest";
import { initialState, isTerminal, seahavenTowersRuleset } from "./state.js";
import type { SeahavenTowersState, SeahavenTowersSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: SeahavenTowersSettings = {};

describe("Seahaven Towers initialState", () => {
  it("has 52 cards (10 columns × 5 + 2 in cells)", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("10 columns of 5 face-up cards each", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 10; i++) {
      const p = s.piles.find((pp) => pp.id === `c${i}`)!;
      expect(p.cards.length).toBe(5);
      expect(p.faceUpCount).toBe(5);
    }
  });

  it("2 cells (fc2, fc3) start with cards, 2 (fc1, fc4) are empty", () => {
    const s = initialState(7, S);
    expect(s.piles.find((p) => p.id === "fc1")!.cards.length).toBe(0);
    expect(s.piles.find((p) => p.id === "fc2")!.cards.length).toBe(1);
    expect(s.piles.find((p) => p.id === "fc3")!.cards.length).toBe(1);
    expect(s.piles.find((p) => p.id === "fc4")!.cards.length).toBe(0);
  });
});

describe("Seahaven Towers rules", () => {
  it("tableau builds suited descending — same suit required", () => {
    const target: Pile = { id: "c1", kind: "tableau", cards: [{ suit: "♠", rank: 7, id: "x" }], faceUpCount: 1 };
    expect(seahavenTowersRuleset.canStack(target, [{ suit: "♠", rank: 6, id: "y" }])).toBe(true);
    // Different suit — rejected (key Seahaven rule)
    expect(seahavenTowersRuleset.canStack(target, [{ suit: "♥", rank: 6, id: "z" }])).toBe(false);
  });

  it("only Kings fill empty columns", () => {
    const empty: Pile = { id: "c1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(seahavenTowersRuleset.canStack(empty, [{ suit: "♠", rank: 13, id: "k" }])).toBe(true);
    expect(seahavenTowersRuleset.canStack(empty, [{ suit: "♠", rank: 1, id: "a" }])).toBe(false);
    expect(seahavenTowersRuleset.canStack(empty, [{ suit: "♠", rank: 5, id: "5" }])).toBe(false);
  });
});

describe("Seahaven Towers isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 52 on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `sht${idx++}` })),
      });
    }
    for (let i = 1; i <= 10; i++) piles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    for (let i = 1; i <= 4; i++) piles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    const won: SeahavenTowersState = { piles, score: 520, movesMade: 100, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(520);
  });
});

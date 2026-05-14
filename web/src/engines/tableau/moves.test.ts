import { describe, expect, it } from "vitest";
import { canMove, applyMove, klondikeTableauStack, foundationStack, findAutoMove } from "./moves.js";
import type { Pile, Ruleset } from "./types.js";
import type { Card } from "../deck/index.js";

const card = (suit: "♠"|"♥"|"♦"|"♣", rank: number): Card => ({ suit, rank: rank as any, id: `${suit}${rank}` });

const klondikePickUp: (p: Pile, n: number) => boolean = () => true; // Klondike allows any suffix of face-up cards; simplified here

const klondikeRules: Ruleset = {
  canStack: (target, moving) => klondikeTableauStack(target, moving) || foundationStack(target, moving),
  canPickUp: klondikePickUp,
};

describe("tableau moves — Klondike ruleset", () => {
  it("red 7 on black 8 is legal", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 8)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♥", 7)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, klondikeRules)).toBe(true);
  });

  it("same-color descending is illegal", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 8)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♣", 7)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, klondikeRules)).toBe(false);
  });

  it("empty tableau accepts any card (default permissive — FreeCell-style)", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [] },
      { id: "t2", kind: "tableau", cards: [card("♠", 13)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, klondikeRules)).toBe(true);
  });

  it("kingOnly: empty tableau accepts a King", () => {
    const kingOnlyRules: Ruleset = {
      canStack: (t, m) => klondikeTableauStack(t, m, { kingOnly: true }) || foundationStack(t, m),
      canPickUp: () => true,
    };
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [] },
      { id: "t2", kind: "tableau", cards: [card("♠", 13)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, kingOnlyRules)).toBe(true);
  });

  it("kingOnly: empty tableau rejects non-King (Klondike standard rule)", () => {
    const kingOnlyRules: Ruleset = {
      canStack: (t, m) => klondikeTableauStack(t, m, { kingOnly: true }) || foundationStack(t, m),
      canPickUp: () => true,
    };
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [] },
      { id: "t2", kind: "tableau", cards: [card("♣", 10)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, kingOnlyRules)).toBe(false);
  });

  it("foundation requires Ace first, then ascending same suit", () => {
    const piles: Pile[] = [
      { id: "f1", kind: "foundation", cards: [] },
      { id: "t1", kind: "tableau", cards: [card("♠", 1)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "f1", count: 1 }, klondikeRules)).toBe(true);

    const piles2: Pile[] = [
      { id: "f1", kind: "foundation", cards: [card("♠", 1)] },
      { id: "t1", kind: "tableau", cards: [card("♠", 2)], faceUpCount: 1 },
    ];
    expect(canMove(piles2, { fromPile: "t1", toPile: "f1", count: 1 }, klondikeRules)).toBe(true);

    const piles3: Pile[] = [
      { id: "f1", kind: "foundation", cards: [card("♠", 1)] },
      { id: "t1", kind: "tableau", cards: [card("♥", 2)], faceUpCount: 1 },
    ];
    expect(canMove(piles3, { fromPile: "t1", toPile: "f1", count: 1 }, klondikeRules)).toBe(false);
  });

  it("applyMove transfers cards and updates faceUpCount", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 8)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♦", 10), card("♥", 7)], faceUpCount: 1 },
    ];
    const next = applyMove(piles, { fromPile: "t2", toPile: "t1", count: 1 });
    const t1 = next.find((p) => p.id === "t1")!;
    const t2 = next.find((p) => p.id === "t2")!;
    expect(t1.cards.map((c) => c.id)).toEqual(["♠8", "♥7"]);
    expect(t1.faceUpCount).toBe(2);
    expect(t2.cards.map((c) => c.id)).toEqual(["♦10"]);
    // t2's remaining card was face-down (faceUpCount=1 but now top was removed); engine auto-reveals → 1
    expect(t2.faceUpCount).toBe(1);
  });
});

describe("findAutoMove", () => {
  it("prefers foundation when available", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 1)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♥", 2)], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(findAutoMove(piles, "t1", 1, klondikeRules)).toBe("f1");
  });

  it("picks a non-empty tableau over an empty one", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♥", 7)], faceUpCount: 1 },  // source — red 7
      { id: "t2", kind: "tableau", cards: [card("♠", 8)], faceUpCount: 1 },  // black 8 — accepts red 7
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },              // empty
      { id: "f1", kind: "foundation", cards: [] },                             // not an Ace
    ];
    expect(findAutoMove(piles, "t1", 1, klondikeRules)).toBe("t2");
  });

  it("falls back to empty tableau when no other target", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 13)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♠", 7)], faceUpCount: 1 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(findAutoMove(piles, "t1", 1, klondikeRules)).toBe("t3");
  });

  it("returns null when no legal target exists", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [card("♠", 5)], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [card("♥", 13)], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(findAutoMove(piles, "t1", 1, klondikeRules)).toBe(null);
  });
});

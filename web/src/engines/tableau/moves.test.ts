import { describe, expect, it } from "vitest";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "./moves.js";
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

  it("empty tableau accepts any card", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [] },
      { id: "t2", kind: "tableau", cards: [card("♠", 13)], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, klondikeRules)).toBe(true);
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

import type { Card } from "../deck/index.js";

export type PileKind = "tableau" | "foundation" | "stock" | "waste" | "freecell";

export interface Pile {
  id: string;
  kind: PileKind;
  cards: Card[];        // bottom → top (last is top)
  faceUpCount?: number; // for tableau piles; last N are face-up
}

export interface Move {
  fromPile: string;
  toPile: string;
  /** number of cards moved, counted from the top of fromPile */
  count: number;
}

/** Can the given sequence of cards legally land on the given target pile? */
export type CanStack = (target: Pile, moving: Card[]) => boolean;

/** Is the given group of cards (top N of fromPile) a legal sequence to pick up? */
export type CanPickUp = (fromPile: Pile, count: number) => boolean;

export interface Ruleset {
  canStack: CanStack;
  canPickUp: CanPickUp;
}

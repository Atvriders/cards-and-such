import type { Move, Pile, Ruleset } from "./types.js";

export function topN(pile: Pile, n: number): Pile["cards"] {
  return pile.cards.slice(pile.cards.length - n);
}

export function canMove(piles: readonly Pile[], move: Move, ruleset: Ruleset): boolean {
  if (move.count <= 0) return false;
  const from = piles.find((p) => p.id === move.fromPile);
  const to = piles.find((p) => p.id === move.toPile);
  if (!from || !to) return false;
  if (from.cards.length < move.count) return false;
  if (!ruleset.canPickUp(from, move.count)) return false;
  const moving = topN(from, move.count);
  return ruleset.canStack(to, moving);
}

export function applyMove(piles: readonly Pile[], move: Move): Pile[] {
  const out = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  const from = out.find((p) => p.id === move.fromPile)!;
  const to = out.find((p) => p.id === move.toPile)!;
  const picked = from.cards.splice(from.cards.length - move.count, move.count);
  to.cards.push(...picked);
  // Auto-reveal: if fromPile is tableau and top card is now face-down, bump faceUpCount.
  if (from.kind === "tableau") {
    const newTop = from.cards.length;
    const currentFaceUp = from.faceUpCount ?? 0;
    // All removed cards were face-up. If any cards remain and currentFaceUp hit 0 on this pile,
    // the top remaining card auto-reveals.
    const remaining = from.cards.length;
    const newFaceUp = Math.max(0, Math.min(remaining, currentFaceUp - move.count));
    from.faceUpCount = remaining > 0 && newFaceUp === 0 ? 1 : newFaceUp;
    void newTop;
  }
  if (to.kind === "tableau") {
    to.faceUpCount = (to.faceUpCount ?? 0) + move.count;
  }
  return out;
}

/** Common stackers that games can compose */

import type { Card } from "../deck/index.js";
import { isRed } from "../deck/index.js";

/** Descending, alternating color, on tableau. Empty tableau accepts any card. */
export const klondikeTableauStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return isRed(top.suit) !== isRed(bottom.suit) && rankVal(top) === rankVal(bottom) + 1;
};

/** Same-suit ascending, Ace first. */
export const foundationStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === 1;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && rankVal(c) === rankVal(top) + 1;
};

/** FreeCell cell accepts exactly one card into an empty cell. */
export const freecellCellStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "freecell") return false;
  return target.cards.length === 0 && moving.length === 1;
};

function rankVal(c: Card): number { return c.rank === 1 ? 1 : (c.rank as number); }

export { rankVal };

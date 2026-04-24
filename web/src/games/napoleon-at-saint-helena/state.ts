import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Napoleon at St. Helena (also known as Forty Thieves variant with 10 tableau piles).
 * - 2 decks (104 cards)
 * - 10 tableau piles, each with 4 cards face-up
 * - Foundations: 8 piles, built up by suit from Ace
 * - Stock + waste (draw one)
 * - Tableau: same-suit descending
 */
export interface NapoleonState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type NapoleonAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] as const;

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

/** Napoleon at St. Helena: same-suit descending on tableau. Empty column: any card. */
export const napoleonRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Alternating color, descending (like Forty Thieves but alt-color instead of same-suit)
    // Actually Napoleon at St. Helena uses same-suit. Let me use same-suit like classic:
    return top.suit === card.suit && (top.rank as number) === (card.rank as number) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      // Must be a valid same-suit descending run
      if (count > (pile.faceUpCount ?? 0)) return false;
      if (count === 1) return true;
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const upper = cards[i]!;
        const lower = cards[i + 1]!;
        if (upper.suit !== lower.suit) return false;
        if ((upper.rank as number) !== (lower.rank as number) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

function doubleDeck(): Card[] {
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "_b" }));
  return [...d1, ...d2];
}

export function initialState(seed: number): NapoleonState {
  const rng = mulberry32(seed);
  const deck = shuffle(doubleDeck(), rng);

  const piles: Pile[] = [];

  // 10 tableau columns, 4 cards each (40 cards dealt)
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 4);
    idx += 4;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 4,
    });
  }

  // Stock: remaining 64 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // Foundations: 8 empty piles (2 per suit)
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, movesMade: 0, won: false };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalCardsOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: NapoleonState, action: NapoleonAction): NapoleonState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      nw.cards.push(ns.cards.pop()!);
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length > 0 || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, napoleonRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const won = totalCardsOnFoundations(newPiles) === 104;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      const sourceIds = ["waste", ...TABLEAU_IDS];
      while (moved) {
        moved = false;
        for (const srcId of sourceIds) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, napoleonRuleset)) {
              piles = applyMove(piles, mv);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, movesMade: moves, won: totalCardsOnFoundations(piles) === 104 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: NapoleonState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 104) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}

// suppress unused warning
void isRed;

import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Four Seasons (also called Corner Card or Vanishing Cross):
 * - 5 tableau piles arranged in a cross/plus shape
 * - 4 foundation piles in corners
 * - The first card of the stock starts the foundations (determines foundation start rank)
 * - Foundations: same-suit, wrapping from the starting rank
 * - Tableau: no suit/color restriction, just descending by rank (any suit)
 * - Stock: draw one, no redeal
 */
export interface FourSeasonsState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
  /** The rank that foundations start at (the first card dealt determines this). */
  foundationStartRank: number;
}

export type FourSeasonsAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export function makeFourSeasonsRuleset(startRank: number): Ruleset {
  return {
    canStack: (target, moving) => {
      if (target.kind === "foundation") {
        if (moving.length !== 1) return false;
        const c = moving[0]!;
        if (target.cards.length === 0) return (c.rank as number) === startRank;
        const top = target.cards[target.cards.length - 1]!;
        if (top.suit !== c.suit) return false;
        const expected = top.rank === 13 ? 1 : (top.rank as number) + 1;
        return (c.rank as number) === expected;
      }
      if (target.kind === "tableau") {
        if (moving.length !== 1) return false;
        const card = moving[0]!;
        if (target.cards.length === 0) return true;
        const top = target.cards[target.cards.length - 1]!;
        // Any suit, descending rank (1 lower, wrapping K below A)
        return (top.rank as number) === (card.rank as number) + 1;
      }
      return false;
    },
    canPickUp: (pile, count) => {
      if (pile.kind === "waste" || pile.kind === "foundation") return count === 1;
      if (pile.kind === "tableau") return count === 1;
      return false;
    },
  };
}

export function initialState(seed: number): FourSeasonsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // First card determines foundation start rank
  const firstCard: Card = deck[0]!;
  const startRank = firstCard.rank as number;

  // Place one card of each suit with the start rank on the 4 foundations
  // (find the 4 cards with startRank, spread across foundations)
  const startCards: Card[] = [];
  const rest: Card[] = [];
  for (const card of deck) {
    if ((card.rank as number) === startRank && startCards.length < 4) {
      startCards.push(card);
    } else {
      rest.push(card);
    }
  }

  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: startCards[i] ? [startCards[i]!] : [] });
  }

  // Deal 5 tableau piles, 1 card each
  for (let i = 0; i < 5; i++) {
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards: [rest[i]!],
      faceUpCount: 1,
    });
  }

  // Stock: remaining 43 cards
  piles.push({ id: "stock", kind: "stock", cards: rest.slice(5), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  return { piles, movesMade: 0, won: false, foundationStartRank: startRank };
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

export function reducer(state: FourSeasonsState, action: FourSeasonsAction): FourSeasonsState {
  if (state.won) return state;
  const ruleset = makeFourSeasonsRuleset(state.foundationStartRank);

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

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, ruleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const won = totalCardsOnFoundations(newPiles) === 52;
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
            if (canMove(piles, mv, ruleset)) {
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
      return { ...state, piles, movesMade: moves, won: totalCardsOnFoundations(piles) === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FourSeasonsState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 200 - state.movesMade) };
}

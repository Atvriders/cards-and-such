import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Corners (also called Four Corners): a simple solitaire.
 * Layout: 4 corner tableau piles, 1 central foundation (Aces up to Kings by suit), stock+waste.
 * Actually the classic "Corners" uses 4 foundations in the corners and a central draw pile.
 * Here: 4 foundation piles, 4 tableau "corner" piles, stock+waste.
 * Tableau corners: build any suit, any rank order? No — Corners builds on tableau regardless of rank/suit,
 * but foundations build by suit Ace-King.
 * We'll implement the common ruleset: corners accept any single card (discard pile style),
 * and you try to get aces out to foundations as quickly as possible.
 * The classic Corners solitaire uses 4 discard corner piles + foundations + stock.
 * Corner piles: accept any card, but only the top card is playable.
 * Foundation piles: same-suit ascending from Ace.
 */
export interface CornersSolitaireState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type CornersSolitaireAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CORNER_IDS = ["cr1", "cr2", "cr3", "cr4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Corners ruleset: foundations standard Ace-King by suit. Corners accept any single card. */
export const cornersRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") {
      // corner piles: accept any single card
      return moving.length === 1;
    }
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1; // only top card
    return false;
  },
};

export function initialState(seed: number): CornersSolitaireState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Deal 3 cards to each of the 4 corner piles
  let idx = 0;
  for (const id of CORNER_IDS) {
    piles.push({
      id,
      kind: "tableau",
      cards: deck.slice(idx, idx + 3),
      faceUpCount: 3,
    });
    idx += 3;
  }

  // Stock: remaining 40 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // Foundations: empty
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

export function reducer(
  state: CornersSolitaireState,
  action: CornersSolitaireAction,
): CornersSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      const card = ns.cards.pop()!;
      nw.cards.push(card);
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
      if (!canMove(state.piles, { fromPile, toPile, count }, cornersRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const won = totalCardsOnFoundations(newPiles) === 52;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      const sourceIds = ["waste", ...CORNER_IDS];
      while (moved) {
        moved = false;
        for (const srcId of sourceIds) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, cornersRuleset)) {
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

export function isTerminal(state: CornersSolitaireState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 200 - state.movesMade) };
}

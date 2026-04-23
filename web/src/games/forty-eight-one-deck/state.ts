import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Forty and Eight — One Deck Variant:
 * 1 deck (52 cards).
 * 4 tableau columns × 5 cards (20 cards dealt).
 * 4 foundations (build up same-suit from Ace).
 * 4 free cells.
 * 32 cards in stock (drawn one at a time).
 * Build tableau down same-suit, 1 card at a time.
 */

export interface FortyEightOneDeckSettings {
  _dummy?: undefined;
}

export interface FortyEightOneDeckState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: FortyEightOneDeckSettings;
}

export type FortyEightOneDeckAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;

export const fortyEightOneDeckRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "freecell") {
      return moving.length === 1 && target.cards.length === 0;
    }
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    return top.suit === card.suit && rankVal(top) === rankVal(card) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "freecell" || pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1;
    return false;
  },
};

export function initialState(seed: number, settings: FortyEightOneDeckSettings): FortyEightOneDeckState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 5) as Card[];
    idx += 5;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 5 });
  }

  const stockCards = deck.slice(idx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  for (const id of FREECELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: FortyEightOneDeckState, action: FortyEightOneDeckAction): FortyEightOneDeckState {
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

    case "move": {
      const { fromPile, toPile, count } = action;
      const mv = { fromPile, toPile, count };
      if (!canMove(state.piles, mv, fortyEightOneDeckRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, mv);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FortyEightOneDeckState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

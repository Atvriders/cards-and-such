import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SlyFoxSettings {
  _dummy?: undefined;
}

export interface SlyFoxState {
  piles: Pile[];
  score: number;
  movesMade: number;
  redealsLeft: number;
  won: boolean;
  settings: SlyFoxSettings;
}

export type SlyFoxAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "draw" }
  | { type: "redeal" };

// 20 tableau slots (5 rows × 4 cols), numbered t1-t20
const TABLEAU_IDS = Array.from({ length: 20 }, (_, i) => `t${i + 1}`);
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const slyFoxRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    return false; // no tableau building in Sly Fox
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1;
    if (pile.kind === "waste") return count === 1;
    return false;
  },
};

export function initialState(seed: number, settings: SlyFoxSettings): SlyFoxState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Pull out 4 Aces (one per suit) for foundations
  const foundationCards: Card[] = [];
  const remainingDeck: Card[] = [];
  const aceSuits = new Set<string>();

  for (const card of deck) {
    if (card.rank === 1 && aceSuits.size < 4 && !aceSuits.has(card.suit)) {
      aceSuits.add(card.suit);
      foundationCards.push(card);
    } else {
      remainingDeck.push(card);
    }
  }

  // Deal 20 cards face-up to tableau (first 20 of remaining)
  const piles: Pile[] = [];
  for (let i = 0; i < 20; i++) {
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards: [remainingDeck[i]!],
      faceUpCount: 1,
    });
  }

  // Stock: remaining 28 cards (48 - 20)
  piles.push({ id: "stock", kind: "stock", cards: remainingDeck.slice(20), faceUpCount: 0 });

  // Waste: empty
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // 4 foundations, each starting with an Ace
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [foundationCards[i]!] });
  }

  return { piles, score: 0, movesMade: 0, redealsLeft: 2, won: false, settings };
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

export function reducer(state: SlyFoxState, action: SlyFoxAction): SlyFoxState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;
      const newWaste = newPiles.find((p) => p.id === "waste")!;

      const card = newStock.cards.pop()!;
      newWaste.cards.push(card);

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, slyFoxRuleset)) return state;

      // Special: moving FROM tableau to another tableau cell replaces (swap/move to empty)
      // In Sly Fox, tableau cells hold 1 card. Moving between tableau replaces.
      const fromP = getPile(state.piles, fromPile);
      const toP = getPile(state.piles, toPile);
      if (!fromP || !toP) return state;

      // Only allow tableau→foundation or waste→foundation or waste→tableau-empty
      const allowedSrc = fromP.kind === "tableau" || fromP.kind === "waste";
      const allowedDst = toP.kind === "foundation" || (toP.kind === "tableau" && toP.cards.length === 0);
      if (!allowedSrc || !allowedDst) return state;

      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "redeal": {
      if (state.redealsLeft <= 0) return state;

      const stock = getPile(state.piles, "stock");
      if (stock && stock.cards.length > 0) return state; // only redeal when stock empty

      // Collect tableau cards, shuffle, and redeal 20
      const tableauCards: Card[] = [];
      for (const id of TABLEAU_IDS) {
        const pile = state.piles.find((p) => p.id === id);
        if (pile) tableauCards.push(...pile.cards);
      }

      // Use movesMade as seed offset for the reshuffle (deterministic)
      // We'll just reverse for simplicity since we can't call RNG again easily
      const reshuffled = [...tableauCards].reverse();

      const newPiles = state.piles.map((p) => {
        if (TABLEAU_IDS.includes(p.id)) {
          const idx = TABLEAU_IDS.indexOf(p.id);
          const card = reshuffled[idx];
          return { ...p, cards: card ? [card] : [], faceUpCount: card ? 1 : 0 };
        }
        return { ...p, cards: [...p.cards] };
      });

      // Any extra reshuffled cards beyond 20 go to stock
      const extra = reshuffled.slice(20);
      const newStock = newPiles.find((p) => p.id === "stock")!;
      newStock.cards = [...extra];

      return {
        ...state,
        piles: newPiles,
        redealsLeft: state.redealsLeft - 1,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SlyFoxState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

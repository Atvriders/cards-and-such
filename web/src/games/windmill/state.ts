import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WindmillState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type WindmillAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

// 4 sail columns arranged around a center position
const SAIL_IDS = ["s1", "s2", "s3", "s4"] as const;
// 4 corner foundations
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const windmillRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "freecell") {
      // Reserve: holds exactly 1 card
      return target.cards.length === 0;
    }
    if (target.kind === "tableau") {
      // Sail: build down any suit (rank only)
      if (target.cards.length === 0) return true;
      const top = target.cards[target.cards.length - 1]!;
      return rankVal(top) === rankVal(card) + 1;
    }
    return false;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "waste") return pile.cards.length > 0;
    if (pile.kind === "freecell") return pile.cards.length > 0;
    if (pile.kind === "foundation") return false;
    if (pile.kind === "tableau") {
      return (pile.faceUpCount ?? 0) >= 1;
    }
    return false;
  },
};

export function initialState(seed: number): WindmillState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  let idx = 0;

  // 4 sail columns of 3 cards each (12 cards total), all face-up
  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({ id: SAIL_IDS[i]!, kind: "tableau", cards, faceUpCount: 3 });
  }

  // Stock: remaining 40 cards
  const stockCards = deck.slice(idx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // Reserve (freecell kind, single slot)
  piles.push({ id: "reserve", kind: "freecell", cards: [] });

  // 4 corner foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false };
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

export function reducer(state: WindmillState, action: WindmillAction): WindmillState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste) return state;

      if (stock.cards.length === 0 && waste.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;
      const newWaste = newPiles.find((p) => p.id === "waste")!;

      if (newStock.cards.length === 0) {
        // Recycle
        newStock.cards = [...newWaste.cards].reverse();
        newWaste.cards = [];
      } else {
        const card = newStock.cards.pop()!;
        newWaste.cards.push(card);
      }

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, windmillRuleset)) return state;
      const newPiles = applyMove(state.piles, move);
      const newTotal = totalCardsOnFoundations(newPiles);
      const won = newTotal === 52;
      const toP = getPile(state.piles, toPile);
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

export function isTerminal(state: WindmillState): { score: number } | null {
  const total = totalCardsOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

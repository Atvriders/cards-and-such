import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Congress: 2 decks. 8 reserve cells (pre-filled). 8 foundations. Stock + waste.
// Tableau builds down ANY-SUIT. Foundations up same-suit A→K.

export interface CongressSettings {
  _dummy?: undefined;
}

export interface CongressState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: CongressSettings;
}

export type CongressAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

// 8 reserve slots (freecell kind — single card per slot, but pre-filled)
const RESERVE_IDS = ["r1","r2","r3","r4","r5","r6","r7","r8"] as const;
// 4 tableau columns
const TABLEAU_IDS = ["t1","t2","t3","t4"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;

export const congressRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    // Reserve: can only place single card in an empty reserve slot
    if (target.kind === "freecell") {
      return target.cards.length === 0 && moving.length === 1;
    }
    if (target.kind !== "tableau") return false;
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Descending any suit
    return rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "foundation") return count === 1;
    if (pile.kind === "freecell") return count === 1; // reserve
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number, settings: CongressSettings): CongressState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 8 reserve slots (freecell kind) pre-filled with 1 card each
  for (let i = 0; i < 8; i++) {
    const card = deck[idx++] as Card;
    piles.push({ id: RESERVE_IDS[i]!, kind: "freecell", cards: [card] });
  }

  // 8 foundations
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // 4 tableau columns — deal remaining 96 cards evenly (24 each)
  // Actually stock holds most — deal 4 columns of 8 each = 32 cards
  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 8) as Card[];
    idx += 8;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 8 });
  }

  // Stock: remaining cards
  const stockCards = deck.slice(idx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

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

export function reducer(state: CongressState, action: CongressAction): CongressState {
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
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, congressRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 104;

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

export function isTerminal(state: CongressState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 104) return null;
  return { score: state.score };
}

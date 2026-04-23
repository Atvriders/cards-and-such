import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle, isRed } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface ThumbAndPouchState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type ThumbAndPouchAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/**
 * Thumb and Pouch tableau: build down, ANY suit except same suit.
 * Empty columns accept any card.
 */
const thumbTableauStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  // Must be different suit and one rank lower
  return top.suit !== bottom.suit && rankVal(top) === rankVal(bottom) + 1;
};

export const thumbRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return thumbTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      if (count > faceUp) return false;
      // Sequence must be descending, any suit except same
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i]!;
        const b = cards[i + 1]!;
        if (a.suit === b.suit) return false;
        if (rankVal(a) !== rankVal(b) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

// keep isRed used for potential future scoring — suppress unused warning
void isRed;

export function initialState(seed: number): ThumbAndPouchState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];
  let deckIdx = 0;

  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(deckIdx, deckIdx + count);
    deckIdx += count;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 1 });
  }

  piles.push({ id: "stock", kind: "stock", cards: deck.slice(deckIdx), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

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

export function reducer(state: ThumbAndPouchState, action: ThumbAndPouchAction): ThumbAndPouchState {
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
      if (!canMove(state.piles, { fromPile, toPile, count }, thumbRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const toP = getPile(state.piles, toPile);
      const scoreDelta = toP?.kind === "foundation" ? 10 : 0;
      const newTotal = totalCardsOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: newTotal === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        const sourceIds = ["waste", ...TABLEAU_IDS];
        for (const sid of sourceIds) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, thumbRuleset)) {
              piles = applyMove(piles, move);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, score, movesMade: state.movesMade + 1, won: totalCardsOnFoundations(piles) === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ThumbAndPouchState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

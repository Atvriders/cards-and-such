import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EasthavenState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type EasthavenAction =
  | { type: "deal-row" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const easthavenRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return klondikeTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return false;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      if (count > faceUp) return false;
      // Must be alternating colors descending
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i]!;
        const b = cards[i + 1]!;
        const aRed = a.suit === "♥" || a.suit === "♦";
        const bRed = b.suit === "♥" || b.suit === "♦";
        if (aRed === bRed) return false;
        if (a.rank !== b.rank + 1) return false;
      }
      return true;
    }
    return false;
  },
};

export function initialState(seed: number): EasthavenState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  // 7 columns of 3 cards each (21 total), only top face-up
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 1 });
  }

  // Stock: remaining 31 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // Foundations
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

export function reducer(state: EasthavenState, action: EasthavenAction): EasthavenState {
  if (state.won) return state;

  switch (action.type) {
    case "deal-row": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;

      // Deal one card to each column (or as many as stock has)
      const dealCount = Math.min(7, newStock.cards.length);
      for (let i = 0; i < dealCount; i++) {
        const card = newStock.cards.pop()!;
        const col = newPiles.find((p) => p.id === TABLEAU_IDS[i])!;
        col.cards.push(card);
        col.faceUpCount = (col.faceUpCount ?? 0) + 1;
      }

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, easthavenRuleset)) return state;
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
        for (const sid of TABLEAU_IDS) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, easthavenRuleset)) {
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
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalCardsOnFoundations(piles) === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: EasthavenState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

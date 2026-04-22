import type { Pile, Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ScorpionTailSettings {
  _dummy?: undefined;
}

export interface ScorpionTailState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  reserveDealt: boolean;
  settings: ScorpionTailSettings;
}

export type ScorpionTailAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-reserve" };

// 9 tableau columns
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9"] as const;

/** Scorpion Tail: same rules as Scorpion — same suit descending, Yukon-style pick-up. */
export const scorpionTailRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true; // empty accepts anything
    const top = target.cards[target.cards.length - 1]!;
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    return count <= faceUp;
  },
};

/** Check if the top 13 cards of a tableau pile form a K..A same-suit sequence. */
function hasCompleteSuit(pile: Pile): boolean {
  if (pile.cards.length < 13) return false;
  const top13 = pile.cards.slice(pile.cards.length - 13);
  const suit = top13[0]!.suit;
  for (let i = 0; i < 13; i++) {
    const c = top13[i]!;
    if (c.suit !== suit) return false;
    if ((c.rank as number) !== 13 - i) return false;
  }
  return true;
}

function autoRemoveCompleted(piles: Pile[]): { piles: Pile[]; newlyCompleted: number } {
  let result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  let newlyCompleted = 0;
  let found = true;

  while (found) {
    found = false;
    for (const id of TABLEAU_IDS) {
      const pile = result.find((p) => p.id === id)!;
      if (hasCompleteSuit(pile)) {
        pile.cards.splice(pile.cards.length - 13, 13);
        pile.faceUpCount = Math.max(0, (pile.faceUpCount ?? 0) - 13);
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) pile.faceUpCount = 1;
        newlyCompleted++;
        found = true;
      }
    }
  }

  return { piles: result, newlyCompleted };
}

/**
 * Scorpion Tail deal:
 * 9 columns of 6 cards each = 54... but we only have 52 cards.
 * Adjusted: 9 columns × 5 = 45 cards, reserve = 7 cards.
 * OR: 8 columns × 6 = 48 + 1 col × 4 = 52 total.
 * Use: 7 cols × 6 + 2 cols × 5 = 42 + 10 = 52. Reserve = 0.
 * Better: 9 columns × 5 cards = 45 + 7 reserve = 52. Deal reserve to first 7 cols.
 * Simple: 9 cols, sizes [6,6,6,6,6,4,4,4,4] = 50 + 2 reserve.
 * Actually cleanest: 9 cols of varying size + reserve.
 * Use: cols 1-7 get 6 cards each = 42; cols 8-9 get 4 cards each = 8; reserve = 2. Total=52.
 * Face-down for first 5 cols: 2 face-down. Cols 6-9: all face-up.
 */
export function initialState(seed: number, settings: ScorpionTailSettings): ScorpionTailState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // Columns 1-7: 6 cards each
  for (let i = 0; i < 7; i++) {
    const cards = deck.slice(idx, idx + 6) as Card[];
    idx += 6;
    const faceDownCount = i < 5 ? 2 : 0;
    const faceUpCount = 6 - faceDownCount;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount });
  }
  // Columns 8-9: 4 cards each (all face-up)
  for (let i = 7; i < 9; i++) {
    const cards = deck.slice(idx, idx + 4) as Card[];
    idx += 4;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
  }

  // Reserve: remaining 2 cards
  const reserveCards = deck.slice(idx) as Card[];
  piles.push({ id: "reserve", kind: "stock", cards: reserveCards, faceUpCount: 0 });

  return {
    piles,
    score: 0,
    movesMade: 0,
    completedSuits: 0,
    won: false,
    reserveDealt: false,
    settings,
  };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: ScorpionTailState, action: ScorpionTailAction): ScorpionTailState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, scorpionTailRuleset)) return state;

      const movedPiles = applyMove(state.piles, move);
      const { piles: newPiles, newlyCompleted } = autoRemoveCompleted(movedPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const won = completedSuits === 4;

      return {
        ...state,
        piles: newPiles,
        score: state.score + newlyCompleted * 100,
        movesMade: state.movesMade + 1,
        completedSuits,
        won,
      };
    }

    case "deal-reserve": {
      if (state.reserveDealt) return state;
      const reserve = getPile(state.piles, "reserve");
      if (!reserve || reserve.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newReserve = newPiles.find((p) => p.id === "reserve")!;

      // Deal one card to each of the first N tableau columns (up to reserve count)
      const count = Math.min(newReserve.cards.length, 2);
      for (let i = 0; i < count; i++) {
        const card = newReserve.cards.pop()!;
        const tab = newPiles.find((p) => p.id === TABLEAU_IDS[i]!)!;
        tab.cards.push(card);
        tab.faceUpCount = (tab.faceUpCount ?? 0) + 1;
      }

      const { piles: afterAuto, newlyCompleted } = autoRemoveCompleted(newPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const won = completedSuits === 4;

      return {
        ...state,
        piles: afterAuto,
        score: state.score + newlyCompleted * 100,
        movesMade: state.movesMade + 1,
        completedSuits,
        won,
        reserveDealt: true,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ScorpionTailState): { score: number } | null {
  if (state.completedSuits !== 4) return null;
  return { score: state.score };
}

export { TABLEAU_IDS };

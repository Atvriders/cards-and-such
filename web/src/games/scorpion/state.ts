import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ScorpionSettings {
  _dummy?: undefined;
}

export interface ScorpionState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  reserveDealt: boolean;
  settings: ScorpionSettings;
}

export type ScorpionAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-reserve" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;

export const scorpionRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true; // empty accepts anything (Yukon-like)
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, descending
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    // Like Yukon: any face-up card (and cards above it) can be moved
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

/** After moves, remove any complete K-A same-suit sequences from tableau. */
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

export function initialState(seed: number, settings: ScorpionSettings): ScorpionState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Standard Scorpion: 7 columns of 7 cards each = 49 cards.
  // First 4 columns: 3 face-down + 4 face-up
  // Last 3 columns: all 7 face-up
  // Remaining 3 cards are the reserve (stock)
  const piles: Pile[] = [];
  let idx = 0;

  for (let i = 0; i < 7; i++) {
    const cards = deck.slice(idx, idx + 7) as Card[];
    idx += 7;
    const faceDownCount = i < 4 ? 3 : 0;
    const faceUpCount = 7 - faceDownCount;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount });
  }

  // Reserve: 3 cards
  const reserveCards = deck.slice(idx, idx + 3) as Card[];
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

export function reducer(state: ScorpionState, action: ScorpionAction): ScorpionState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, scorpionRuleset)) return state;

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

      // Deal one card to each of the first 3 tableau columns
      for (let i = 0; i < 3; i++) {
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

export function isTerminal(state: ScorpionState): { score: number } | null {
  if (state.completedSuits !== 4) return null;
  return { score: state.score };
}

import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpideretteSettings {
  _dummy?: undefined;
}

export interface SpideretteState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  settings: SpideretteSettings;
}

export type SpideretteAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-row" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const spideretteRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Spiderette: same suit only for valid placement (like 1-suit Spider)
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    if (count > faceUp) return false;
    const top = pile.cards.slice(pile.cards.length - count);
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i]!;
      const b = top[i + 1]!;
      if (a.suit !== b.suit) return false;
      if (rankVal(a) !== rankVal(b) + 1) return false;
    }
    return true;
  },
};

function hasCompleteSuit(pile: Pile): boolean {
  const { cards } = pile;
  if (cards.length < 13) return false;
  const top13 = cards.slice(cards.length - 13);
  const suit = top13[0]!.suit;
  for (let i = 0; i < 13; i++) {
    const card = top13[i]!;
    if (card.suit !== suit) return false;
    if (card.rank !== 13 - i) return false;
  }
  return true;
}

function autoRemoveCompletedSuits(piles: Pile[]): { piles: Pile[]; newlyCompleted: number } {
  let result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  let newlyCompleted = 0;
  let found = true;

  while (found) {
    found = false;
    for (const id of TABLEAU_IDS) {
      const pile = result.find((p) => p.id === id);
      if (!pile) continue;
      if (hasCompleteSuit(pile)) {
        pile.cards.splice(pile.cards.length - 13, 13);
        pile.faceUpCount = Math.max(0, (pile.faceUpCount ?? 0) - 13);
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) {
          pile.faceUpCount = 1;
        }
        const completedPile = result.find((p) => p.id === "completed")!;
        newlyCompleted += 1;
        found = true;
        void completedPile;
      }
    }
  }

  return { piles: result, newlyCompleted };
}

export function initialState(seed: number, settings: SpideretteSettings): SpideretteState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];
  let idx = 0;

  // 7 tableau columns: col i gets (i+1) cards, 1 face-up on top (like Klondike deal)
  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 1 });
  }

  // Stock: remaining 24 cards (52 - 28 = 24)
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // Completed pile
  piles.push({ id: "completed", kind: "foundation", cards: [] });

  // Foundations (visual placeholders)
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 500, movesMade: 0, completedSuits: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: SpideretteState, action: SpideretteAction): SpideretteState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };

      if (!canMove(state.piles, move, spideretteRuleset)) return state;

      const movedPiles = applyMove(state.piles, move);
      const { piles: newPiles, newlyCompleted } = autoRemoveCompletedSuits(movedPiles);

      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 4;
      const score = Math.max(0, state.score - 1 + newlyCompleted * 100);

      return { ...state, piles: newPiles, score, movesMade, completedSuits, won };
    }

    case "deal-row": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length < 7) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;

      for (const id of TABLEAU_IDS) {
        const card = newStock.cards.pop()!;
        const col = newPiles.find((p) => p.id === id)!;
        col.cards.push(card);
        col.faceUpCount = (col.faceUpCount ?? 0) + 1;
      }

      const { piles: afterRemove, newlyCompleted } = autoRemoveCompletedSuits(newPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 4;
      const score = Math.max(0, state.score - 1 + newlyCompleted * 100);

      return { ...state, piles: afterRemove, score, movesMade, completedSuits, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SpideretteState): { score: number } | null {
  if (state.completedSuits !== 4) return null;
  return { score: Math.max(0, state.score) };
}

import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpiderSettings {
  suits: "1" | "2" | "4";
}

export interface SpiderState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  settings: SpiderSettings;
}

export type SpiderAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-row" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;

export const spiderRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Spider: any suit, but rank must be top.rank = bottom.rank + 1
    return rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    if (count > faceUp) return false;
    // Top `count` cards must form same-suit descending sequence
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

function buildSpiderDeck(suits: "1" | "2" | "4"): Card[] {
  if (suits === "4") return newDeck(2);

  if (suits === "2") {
    // 52 spades + 52 hearts = 104 cards
    // newDeck(4) gives 208 cards (4 copies of 52); filter to spades+hearts = 4×26 = 104
    const deck4 = newDeck(4);
    return deck4.filter((c) => c.suit === "♠" || c.suit === "♥");
  }

  // 1-suit: 104 spades (8 copies of each rank)
  const spadesOnly: Card[] = [];
  for (let c = 0; c < 8; c++) {
    for (let rank = 1; rank <= 13; rank++) {
      spadesOnly.push({ suit: "♠", rank: rank as Card["rank"], id: `s${c}-${rank}` });
    }
  }
  return spadesOnly;
}

/**
 * Check if the top 13 cards of a pile form a complete K..A same-suit sequence.
 * Returns true if so.
 */
function hasCompleteSuit(pile: Pile): boolean {
  const { cards } = pile;
  if (cards.length < 13) return false;
  const top13 = cards.slice(cards.length - 13);
  // top13[0] should be K (rank 13), top13[12] should be A (rank 1)
  const suit = top13[0]!.suit;
  for (let i = 0; i < 13; i++) {
    const card = top13[i]!;
    if (card.suit !== suit) return false;
    if (card.rank !== 13 - i) return false;
  }
  return true;
}

/**
 * After a move, scan all tableau columns and auto-remove complete K-A same-suit sequences.
 * Returns updated piles and count of new completed suits.
 */
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
        // Remove top 13 cards and push to completed pile
        const removed = pile.cards.splice(pile.cards.length - 13, 13);
        // Adjust faceUpCount
        pile.faceUpCount = Math.max(0, (pile.faceUpCount ?? 0) - 13);
        // Auto-reveal new top if face-down cards remain
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) {
          pile.faceUpCount = 1;
        }
        const completedPile = result.find((p) => p.id === "completed")!;
        completedPile.cards.push(...removed);
        newlyCompleted += 1;
        found = true;
      }
    }
  }

  return { piles: result, newlyCompleted };
}

export function initialState(seed: number, settings: SpiderSettings): SpiderState {
  const rng = mulberry32(seed);
  const deck = shuffle(buildSpiderDeck(settings.suits), rng);
  const piles: Pile[] = [];
  let idx = 0;

  // 10 tableau columns: first 4 get 6 cards (5 face-down + 1 face-up), last 6 get 5 cards (4 face-down + 1 face-up)
  for (let i = 0; i < 10; i++) {
    const cardsCount = i < 4 ? 6 : 5;
    const cards = deck.slice(idx, idx + cardsCount);
    idx += cardsCount;
    piles.push({ id: `t${i + 1}`, kind: "tableau", cards, faceUpCount: 1 });
  }

  // Stock: remaining 50 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // Completed pile (holds auto-removed suit stacks)
  piles.push({ id: "completed", kind: "foundation", cards: [] });

  return {
    piles,
    score: 500,
    movesMade: 0,
    completedSuits: 0,
    won: false,
    settings,
  };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: SpiderState, action: SpiderAction): SpiderState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };

      if (!canMove(state.piles, move, spiderRuleset)) return state;

      const movedPiles = applyMove(state.piles, move);
      const { piles: newPiles, newlyCompleted } = autoRemoveCompletedSuits(movedPiles);

      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = won ? Math.max(0, 500 - movesMade + 100 * completedSuits) : state.score - 1 + newlyCompleted * 100;

      return {
        ...state,
        piles: newPiles,
        score: Math.max(0, score),
        movesMade,
        completedSuits,
        won,
      };
    }

    case "deal-row": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length < 10) return state;

      // Reject if any column is empty
      for (const id of TABLEAU_IDS) {
        const col = getPile(state.piles, id);
        if (!col || col.cards.length === 0) return state;
      }

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;

      // Deal one card face-up to each of the 10 columns from the top of the stock
      for (const id of TABLEAU_IDS) {
        const card = newStock.cards.pop()!;
        const col = newPiles.find((p) => p.id === id)!;
        col.cards.push(card);
        col.faceUpCount = (col.faceUpCount ?? 0) + 1;
      }

      // Check for auto-completed suits after deal
      const { piles: afterAutoRemove, newlyCompleted } = autoRemoveCompletedSuits(newPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = Math.max(0, state.score - 1 + newlyCompleted * 100);

      return {
        ...state,
        piles: afterAutoRemove,
        score: won ? Math.max(0, 500 - movesMade + 100 * completedSuits) : score,
        movesMade,
        completedSuits,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SpiderState): { score: number } | null {
  if (state.completedSuits !== 8) return null;
  return { score: Math.max(0, state.score) };
}

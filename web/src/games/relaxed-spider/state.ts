import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface RelaxedSpiderSettings {
  suits: "1" | "2" | "4";
}

export interface RelaxedSpiderState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  settings: RelaxedSpiderSettings;
}

export type RelaxedSpiderAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-row" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;

/**
 * Relaxed Spider:
 * - Tableau build: any suit, rank decreasing by 1 (same as standard Spider).
 * - Pick up: any descending sequence regardless of suit (relaxed from same-suit-only).
 * - Auto-remove: King + any 12-card descending sequence (regardless of suit).
 */
export const relaxedSpiderRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    return rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    if (count > faceUp) return false;
    // Any descending sequence (no suit restriction)
    const top = pile.cards.slice(pile.cards.length - count);
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i]!;
      const b = top[i + 1]!;
      if (rankVal(a) !== rankVal(b) + 1) return false;
    }
    return true;
  },
};

function buildDeck(suits: "1" | "2" | "4"): Card[] {
  if (suits === "4") return newDeck(2);
  if (suits === "2") {
    return newDeck(4).filter((c) => c.suit === "♠" || c.suit === "♥");
  }
  const cards: Card[] = [];
  for (let c = 0; c < 8; c++) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({ suit: "♠", rank: rank as Card["rank"], id: `rs${c}-${rank}` });
    }
  }
  return cards;
}

/**
 * Check if the top 13 cards of a pile form a K-to-A descending sequence
 * regardless of suit (relaxed auto-remove rule).
 */
function hasCompleteSequence(pile: Pile): boolean {
  const { cards } = pile;
  if (cards.length < 13) return false;
  const top13 = cards.slice(cards.length - 13);
  for (let i = 0; i < 13; i++) {
    if (top13[i]!.rank !== 13 - i) return false;
  }
  return true;
}

function autoRemove(piles: Pile[]): { piles: Pile[]; newlyCompleted: number } {
  let result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  let newlyCompleted = 0;
  let found = true;

  while (found) {
    found = false;
    for (const id of TABLEAU_IDS) {
      const pile = result.find((p) => p.id === id);
      if (!pile) continue;
      if (hasCompleteSequence(pile)) {
        pile.cards.splice(pile.cards.length - 13, 13);
        pile.faceUpCount = Math.max(0, (pile.faceUpCount ?? 0) - 13);
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) {
          pile.faceUpCount = 1;
        }
        const completed = result.find((p) => p.id === "completed")!;
        completed.cards.push(...Array(13).fill(null).map((_, i) => ({
          suit: "♠" as const, rank: (13 - i) as Card["rank"], id: `done-${newlyCompleted}-${i}`
        })));
        newlyCompleted += 1;
        found = true;
      }
    }
  }
  return { piles: result, newlyCompleted };
}

export function initialState(seed: number, settings: RelaxedSpiderSettings): RelaxedSpiderState {
  const rng = mulberry32(seed);
  const deck = shuffle(buildDeck(settings.suits), rng);
  const piles: Pile[] = [];
  let idx = 0;

  for (let i = 0; i < 10; i++) {
    const count = i < 4 ? 6 : 5;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({ id: `t${i + 1}`, kind: "tableau", cards, faceUpCount: 1 });
  }

  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "completed", kind: "foundation", cards: [] });

  return { piles, score: 500, movesMade: 0, completedSuits: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: RelaxedSpiderState, action: RelaxedSpiderAction): RelaxedSpiderState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, relaxedSpiderRuleset)) return state;
      const movedPiles = applyMove(state.piles, { fromPile, toPile, count });
      const { piles: newPiles, newlyCompleted } = autoRemove(movedPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = won
        ? Math.max(0, 500 - movesMade + 100 * completedSuits)
        : Math.max(0, state.score - 1 + newlyCompleted * 100);
      return { ...state, piles: newPiles, score, movesMade, completedSuits, won };
    }

    case "deal-row": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length < 10) return state;
      for (const id of TABLEAU_IDS) {
        const col = getPile(state.piles, id);
        if (!col || col.cards.length === 0) return state;
      }

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      for (const id of TABLEAU_IDS) {
        const card = ns.cards.pop()!;
        const col = newPiles.find((p) => p.id === id)!;
        col.cards.push(card);
        col.faceUpCount = (col.faceUpCount ?? 0) + 1;
      }

      const { piles: afterRemove, newlyCompleted } = autoRemove(newPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = Math.max(0, state.score - 1 + newlyCompleted * 100);
      return {
        ...state,
        piles: afterRemove,
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

export function isTerminal(state: RelaxedSpiderState): { score: number } | null {
  if (state.completedSuits !== 8) return null;
  return { score: Math.max(0, state.score) };
}

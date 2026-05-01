import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import type { Card, Rank } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpiderOneSuitSettings {
  _dummy?: undefined;
}

export interface SpiderOneSuitState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  settings: SpiderOneSuitSettings;
}

export type SpiderOneSuitAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-row" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;

export const spiderOneSuitRuleset: Ruleset = {
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

function buildSpiderOneSuitDeck(): Card[] {
  // 8 copies of each rank, all spades — 104 cards total
  const out: Card[] = [];
  for (let c = 0; c < 8; c++) {
    for (let rank = 1; rank <= 13; rank++) {
      out.push({ suit: "♠", rank: rank as Rank, id: `s1-${c}-${rank}` });
    }
  }
  return out;
}

function hasCompleteSuit(pile: Pile): boolean {
  if (pile.cards.length < 13) return false;
  const top13 = pile.cards.slice(pile.cards.length - 13);
  const suit = top13[0]!.suit;
  for (let i = 0; i < 13; i++) {
    const card = top13[i]!;
    if (card.suit !== suit) return false;
    if (card.rank !== 13 - i) return false;
  }
  return true;
}

function autoRemoveCompletedSuits(piles: Pile[]): { piles: Pile[]; newlyCompleted: number } {
  const result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  let newlyCompleted = 0;
  let found = true;
  while (found) {
    found = false;
    for (const id of TABLEAU_IDS) {
      const pile = result.find((p) => p.id === id);
      if (!pile) continue;
      if (hasCompleteSuit(pile)) {
        const removed = pile.cards.splice(pile.cards.length - 13, 13);
        pile.faceUpCount = Math.max(0, (pile.faceUpCount ?? 0) - 13);
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) {
          pile.faceUpCount = 1;
        }
        const completed = result.find((p) => p.id === "completed")!;
        completed.cards.push(...removed);
        newlyCompleted += 1;
        found = true;
      }
    }
  }
  return { piles: result, newlyCompleted };
}

export function initialState(seed: number, settings: SpiderOneSuitSettings): SpiderOneSuitState {
  const rng = mulberry32(seed);
  const deck = shuffle(buildSpiderOneSuitDeck(), rng);
  const piles: Pile[] = [];
  let idx = 0;

  // 10 columns: first 4 with 6 cards (5 face-down + 1 face-up), last 6 with 5 (4+1)
  for (let i = 0; i < 10; i++) {
    const count = i < 4 ? 6 : 5;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards: deck.slice(idx, idx + count), faceUpCount: 1 });
    idx += count;
  }
  // Stock: remaining 50 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "completed", kind: "foundation", cards: [] });

  return { piles, score: 500, movesMade: 0, completedSuits: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: SpiderOneSuitState, action: SpiderOneSuitAction): SpiderOneSuitState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, spiderOneSuitRuleset)) return state;

      const movedPiles = applyMove(state.piles, move);
      const { piles: newPiles, newlyCompleted } = autoRemoveCompletedSuits(movedPiles);

      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = won ? Math.max(0, 500 - movesMade + 100 * completedSuits) : Math.max(0, state.score - 1 + newlyCompleted * 100);

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

      const { piles: afterAuto, newlyCompleted } = autoRemoveCompletedSuits(newPiles);
      const completedSuits = state.completedSuits + newlyCompleted;
      const movesMade = state.movesMade + 1;
      const won = completedSuits === 8;
      const score = Math.max(0, state.score - 1 + newlyCompleted * 100);
      return { ...state, piles: afterAuto, score: won ? Math.max(0, 500 - movesMade + 100 * completedSuits) : score, movesMade, completedSuits, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SpiderOneSuitState): { score: number } | null {
  if (state.completedSuits !== 8) return null;
  return { score: Math.max(0, state.score) };
}

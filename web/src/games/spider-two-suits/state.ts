import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpiderTwoSuitsSettings {
  _dummy?: undefined;
}

export interface SpiderTwoSuitsState {
  piles: Pile[];
  score: number;
  movesMade: number;
  completedSuits: number;
  won: boolean;
  settings: SpiderTwoSuitsSettings;
}

export type SpiderTwoSuitsAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-row" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;

export const spiderTwoSuitsRuleset: Ruleset = {
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

function buildSpiderTwoSuitsDeck(): Card[] {
  // 4 decks × 4 suits = 208 cards; filter to spades and hearts = 104 cards (4×2×13)
  const deck4 = newDeck(4);
  return deck4.filter((c) => c.suit === "♠" || c.suit === "♥");
}

function hasCompleteSuit(pile: Pile): boolean {
  if (pile.cards.length < 13) return false;
  const top13 = pile.cards.slice(pile.cards.length - 13);
  const suit = top13[0]!.suit;
  for (let i = 0; i < 13; i++) {
    const c = top13[i]!;
    if (c.suit !== suit) return false;
    if (c.rank !== 13 - i) return false;
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
        if (pile.cards.length > 0 && (pile.faceUpCount ?? 0) === 0) pile.faceUpCount = 1;
        const completed = result.find((p) => p.id === "completed")!;
        completed.cards.push(...removed);
        newlyCompleted += 1;
        found = true;
      }
    }
  }
  return { piles: result, newlyCompleted };
}

export function initialState(seed: number, settings: SpiderTwoSuitsSettings): SpiderTwoSuitsState {
  const rng = mulberry32(seed);
  const deck = shuffle(buildSpiderTwoSuitsDeck(), rng);
  const piles: Pile[] = [];
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const count = i < 4 ? 6 : 5;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards: deck.slice(idx, idx + count), faceUpCount: 1 });
    idx += count;
  }
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  piles.push({ id: "completed", kind: "foundation", cards: [] });
  return { piles, score: 500, movesMade: 0, completedSuits: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: SpiderTwoSuitsState, action: SpiderTwoSuitsAction): SpiderTwoSuitsState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, spiderTwoSuitsRuleset)) return state;
      const movedPiles = applyMove(state.piles, { fromPile, toPile, count });
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

export function isTerminal(state: SpiderTwoSuitsState): { score: number } | null {
  if (state.completedSuits !== 8) return null;
  return { score: Math.max(0, state.score) };
}

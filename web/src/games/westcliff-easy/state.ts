import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WestcliffEasyState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type WestcliffEasyAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Descending same-suit stacking on tableau. Empty accepts any card. */
function westcliffEasyTableauStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
}

export const westcliffEasyRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return westcliffEasyTableauStack(target, moving);
    if (target.kind === "waste") return false;
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      if (count > faceUp) return false;
      // Sequence must be same-suit descending
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const upper = cards[i]!;
        const lower = cards[i + 1]!;
        if (upper.suit !== lower.suit) return false;
        if (rankVal(upper) !== rankVal(lower) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

export function initialState(seed: number): WestcliffEasyState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 10 columns × 3 cards; bottom 2 face-down, top face-up
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 1,
    });
  }

  // Remaining 22 cards in stock
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(30), faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // Foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false };
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

export function reducer(state: WestcliffEasyState, action: WestcliffEasyAction): WestcliffEasyState {
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
      if (!canMove(state.piles, { fromPile, toPile, count }, westcliffEasyRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      const won = total === 52;
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WestcliffEasyState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

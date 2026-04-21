import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FortyThievesSettings {
  _dummy?: undefined;
}

export interface FortyThievesState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: FortyThievesSettings;
}

export type FortyThievesAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;

export const fortyThievesRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false; // only 1 card at a time
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true; // empty accepts any single card
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, descending
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1; // only 1 card at a time
    return false;
  },
};

export function initialState(seed: number, settings: FortyThievesSettings): FortyThievesState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 10 tableau columns of 4 cards each (all face-up)
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 4) as Card[];
    idx += 4;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 4,
    });
  }

  // Stock: remaining 64 cards
  const stockCards = deck.slice(idx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  // 8 foundations
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
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

export function reducer(state: FortyThievesState, action: FortyThievesAction): FortyThievesState {
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
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, fortyThievesRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 104;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FortyThievesState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 104) return null;
  return { score: state.score };
}

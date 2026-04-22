import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiplomatSettings {
  _dummy?: undefined;
}

export interface DiplomatState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: DiplomatSettings;
}

export type DiplomatAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;

export const diplomatRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true; // empty accepts any card
    const top = target.cards[target.cards.length - 1]!;
    // Build down any suit (rank only must be descending by 1); can move sequences
    const bottom = moving[0]!;
    // Check: top rank - 1 === bottom rank for descending
    return rankVal(top) === rankVal(bottom) + 1;
    void card;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number, settings: DiplomatSettings): DiplomatState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 8 tableau columns × 4 cards = 32 face-up cards
  for (let i = 0; i < 8; i++) {
    const cards = deck.slice(idx, idx + 4) as Card[];
    idx += 4;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
  }

  // Stock: remaining 72 cards
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

export function reducer(state: DiplomatState, action: DiplomatAction): DiplomatState {
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
      if (!canMove(state.piles, move, diplomatRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 104;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DiplomatState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 104) return null;
  return { score: state.score };
}

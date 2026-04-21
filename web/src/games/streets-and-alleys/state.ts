import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface StreetsAndAlleysSettings {
  _dummy?: undefined;
}

export interface StreetsAndAlleysState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type StreetsAndAlleysAction =
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Same as Beleaguered Castle: down any suit, empty accepts any card. */
const streetsTableauStack = (target: Pile, moving: ReturnType<typeof Array.prototype.slice>): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return rankVal(top) === rankVal(bottom) + 1;
};

export const streetsRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return streetsTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1;
    return false;
  },
};

export function initialState(seed: number, _settings: StreetsAndAlleysSettings): StreetsAndAlleysState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 4 foundations empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // 8 tableau rows: first 4 get 7 cards, last 4 get 6 cards (4×7 + 4×6 = 52)
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    const count = i < 4 ? 7 : 6;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count,
    });
  }

  return { piles, score: 0, movesMade: 0, won: false };
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: StreetsAndAlleysState, action: StreetsAndAlleysAction): StreetsAndAlleysState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, streetsRuleset)) return state;
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

export function isTerminal(state: StreetsAndAlleysState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BeleagueredCastleSettings {
  _dummy?: undefined;
}

export interface BeleagueredCastleState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type BeleagueredCastleAction =
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Beleaguered Castle: tableau builds down any suit (rank only), empty rows accept any card. */
const beleagueredTableauStack = (target: Pile, moving: ReturnType<typeof Array.prototype.slice>): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true; // empty accepts any
  const top = target.cards[target.cards.length - 1]!;
  return rankVal(top) === rankVal(bottom) + 1; // descend by rank, any suit
};

export const beleagueredRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return beleagueredTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1; // only top card movable
    return false;
  },
};

export function initialState(seed: number, _settings: BeleagueredCastleSettings): BeleagueredCastleState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Foundations start with Aces. Pull them out.
  const aces = deck.filter((c) => c.rank === 1);
  const rest = deck.filter((c) => c.rank !== 1);
  // Shuffle rest ordering is already random; deal 6 per row
  // 4 aces on foundations, 48 remaining cards for 8 × 6 tableau
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [aces[i]!] });
  }
  for (let i = 0; i < 8; i++) {
    const cards = rest.slice(i * 6, i * 6 + 6);
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: cards.length,
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

export function reducer(state: BeleagueredCastleState, action: BeleagueredCastleAction): BeleagueredCastleState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, beleagueredRuleset)) return state;
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

export function isTerminal(state: BeleagueredCastleState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

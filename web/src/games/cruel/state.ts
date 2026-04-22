import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle, SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CruelSettings {
  _dummy?: undefined;
}

export interface CruelState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: CruelSettings;
}

export type CruelAction =
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4"] as const;

export const cruelRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return false; // no empty-column fills
    const top = target.cards[target.cards.length - 1]!;
    // Build down same suit
    return top.suit === card.suit && rankVal(top) === rankVal(card) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1; // only top card
    return false;
  },
};

export function initialState(seed: number, settings: CruelSettings): CruelState {
  const rng = mulberry32(seed);
  // Cruel: 4 foundations start with Aces, 12 piles of 4 cards each (48 cards)
  // Pre-place Aces on foundations, shuffle remaining 48 cards
  const allCards: Card[] = [];
  let cardIdx = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      allCards.push({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}-${suit}${rank}` });
    }
  }

  // Separate aces
  const aces = allCards.filter((c) => c.rank === 1);
  const nonAces = allCards.filter((c) => c.rank !== 1);
  const shuffled = shuffle(nonAces, rng);

  const piles: Pile[] = [];

  // 4 foundations pre-loaded with Aces
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [aces[i]!] });
  }

  // 12 tableau piles of 4 cards each
  let idx = 0;
  for (let i = 0; i < 12; i++) {
    const cards = shuffled.slice(idx, idx + 4) as Card[];
    idx += 4;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
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

export function reducer(state: CruelState, action: CruelAction): CruelState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, cruelRuleset)) return state;

      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

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

export function isTerminal(state: CruelState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

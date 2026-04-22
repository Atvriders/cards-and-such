import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Perseverance: Like Cruel but identical rules.
// 4 foundations with Aces pre-placed. 12 tableau piles of 4 face-up cards.
// Build tableau down same-suit, single-card moves only. No stock, no redeals.

export interface PerseveranceSettings {
  _dummy?: undefined;
}

export interface PerseveranceState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: PerseveranceSettings;
}

export type PerseveranceAction =
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4"] as const;

export const perseveranceRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    // Empty columns accept any single card (unlike Cruel which forbids it)
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    return top.suit === card.suit && rankVal(top) === rankVal(card) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1;
    return false;
  },
};

export function initialState(seed: number, settings: PerseveranceSettings): PerseveranceState {
  const rng = mulberry32(seed);

  // Build deck manually so we control ace placement
  const allCards: Card[] = [];
  let cardIdx = 0;
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      allCards.push({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}-${suit}${rank}` });
    }
  }

  const aces = allCards.filter((c) => c.rank === 1);
  const nonAces = allCards.filter((c) => c.rank !== 1);
  const shuffled = shuffle(nonAces, rng);

  const piles: Pile[] = [];

  // Foundations pre-loaded with Aces
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [aces[i]!] });
  }

  // 12 tableau piles of 4 cards each (all face-up)
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

export function reducer(state: PerseveranceState, action: PerseveranceAction): PerseveranceState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, perseveranceRuleset)) return state;

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

export function isTerminal(state: PerseveranceState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LaBelleLucieSettings {
  redeals: "0" | "1" | "2" | "3";
}

export interface LaBelleLucieState {
  piles: Pile[];
  score: number;
  movesMade: number;
  redealsRemaining: number;
  won: boolean;
  settings: LaBelleLucieSettings;
}

export type LaBelleLucieAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "redeal" };

const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

function fanId(i: number): string {
  return `fan${i + 1}`;
}

export const laBelleLucieRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false; // only top card movable
    const bottom = moving[0]!;
    if (target.cards.length === 0) return false; // no moves to empty fans in LBL
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, descending
    return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    return count === 1; // only top card
  },
};

function dealFans(deck: Card[]): Pile[] {
  const piles: Pile[] = [];
  let idx = 0;
  // 17 fans of 3 cards each (51 cards), 1 extra card
  for (let i = 0; i < 17; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({ id: fanId(i), kind: "tableau", cards, faceUpCount: 3 });
  }
  // 18th pile: 1 remaining card
  piles.push({ id: fanId(17), kind: "tableau", cards: deck.slice(idx, idx + 1), faceUpCount: 1 });

  return piles;
}

export function initialState(seed: number, settings: LaBelleLucieSettings): LaBelleLucieState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const fanPiles = dealFans(deck);

  const foundationPiles: Pile[] = FOUNDATION_IDS.map((id) => ({
    id,
    kind: "foundation",
    cards: [],
  }));

  return {
    piles: [...fanPiles, ...foundationPiles],
    score: 0,
    movesMade: 0,
    redealsRemaining: parseInt(settings.redeals, 10),
    won: false,
    settings,
  };
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

export function reducer(state: LaBelleLucieState, action: LaBelleLucieAction): LaBelleLucieState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, laBelleLucieRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "redeal": {
      if (state.redealsRemaining <= 0) return state;

      // Collect all tableau cards (excluding foundations)
      const allCards: Card[] = [];
      for (const pile of state.piles) {
        if (pile.kind === "tableau") {
          allCards.push(...pile.cards);
        }
      }
      if (allCards.length === 0) return state;

      // Shuffle collected cards using a seed derived from move count (deterministic)
      const rng = mulberry32(state.movesMade * 1000 + state.redealsRemaining);
      const shuffled = shuffle(allCards, rng);

      // Re-deal into fans
      const newFanPiles = dealFans(shuffled);
      // Pad shorter last pile to correct index
      const foundationPiles = state.piles.filter((p) => p.kind === "foundation");

      return {
        ...state,
        piles: [...newFanPiles, ...foundationPiles],
        redealsRemaining: state.redealsRemaining - 1,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: LaBelleLucieState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

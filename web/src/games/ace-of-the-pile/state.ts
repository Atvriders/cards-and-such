import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { rankVal } from "../../engines/tableau/moves.js";

export interface AceOfThePileState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type AceOfThePileAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;
const RESERVE_ID = "reserve";

/** Same-suit descending. Empty columns accept any card. Single-card moves only. */
const aotpTableauStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  if (moving.length !== 1) return false;
  const card = moving[0]!;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === card.suit && rankVal(top) === rankVal(card) + 1;
};

export const aotpRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return aotpTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "tableau") return (pile.faceUpCount ?? 0) >= 1;
    if (pile.kind === "stock") return pile.cards.length > 0; // reserve queue
    return false;
  },
};

export function initialState(seed: number): AceOfThePileState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  // 6 tableau columns of 4 cards each, all face-up
  let idx = 0;
  for (let i = 0; i < 6; i++) {
    const cards = deck.slice(idx, idx + 4);
    idx += 4;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
  }

  // Reserve queue: remaining 27 cards, top-only accessible (stock kind)
  // Reversed so the "top" (last element) = first to play
  piles.push({ id: RESERVE_ID, kind: "stock", cards: [...deck.slice(idx)].reverse(), faceUpCount: 0 });

  // Foundations
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalCardsOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: AceOfThePileState, action: AceOfThePileAction): AceOfThePileState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, aotpRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const toP = getPile(state.piles, toPile);
      const scoreDelta = toP?.kind === "foundation" ? 10 : 0;
      const newTotal = totalCardsOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won: newTotal === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        const sources = [...TABLEAU_IDS, RESERVE_ID];
        for (const sid of sources) {
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, aotpRuleset)) {
              piles = applyMove(piles, move);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalCardsOnFoundations(piles) === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AceOfThePileState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, klondikeTableauStack } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CapricieseSettings {
  _dummy?: undefined;
}

export interface CapricieseState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: CapricieseSettings;
}

export type CapricieseAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 2 decks = 104 cards
// 8 foundations (4 up A→K same-suit, 4 more matching suits for 2nd deck)
// 12 tableau columns × 8 cards each (96 cards total; remaining 8 go to first 8 columns as extras)
// Actually: 12 cols × 8 = 96, but 2 decks = 104, so we use 12 cols × 8 = 96 + 8 free = 104
// Simpler: 12 columns, deal 104 / 12 = ~8-9 cards each
const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;

export const capricieseRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    return klondikeTableauStack(target, moving);
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    const faceUp = pile.faceUpCount ?? 0;
    if (count > faceUp) return false;
    if (count > pile.cards.length) return false;
    // Must be a valid alternating-color descending sequence
    const cards = pile.cards.slice(pile.cards.length - count);
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i]!;
      const b = cards[i + 1]!;
      const aRed = a.suit === "♥" || a.suit === "♦";
      const bRed = b.suit === "♥" || b.suit === "♦";
      if (aRed === bRed) return false;
      if (a.rank !== b.rank + 1) return false;
    }
    return true;
  },
};

export function initialState(seed: number, settings: CapricieseSettings): CapricieseState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 12 tableau columns; first 8 columns get 9 cards, last 4 get 8 cards (9×8 + 8×4 = 72+32=104)
  for (let i = 0; i < 12; i++) {
    const count = i < 8 ? 9 : 8;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: count });
  }

  // 8 foundations (will hold 13 each = 104 total across all)
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

export function reducer(state: CapricieseState, action: CapricieseAction): CapricieseState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, capricieseRuleset)) return state;
      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
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

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of TABLEAU_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, capricieseRuleset)) {
              piles = applyMove(piles, move);
              scoreDelta += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const won = totalOnFoundations(piles) === 104;
      return {
        ...state,
        piles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CapricieseState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 104) return null;
  return { score: state.score };
}

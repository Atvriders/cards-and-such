import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, klondikeTableauStack } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MissMilliganSettings {
  _dummy?: undefined;
}

export interface MissMilliganState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: MissMilliganSettings;
}

export type MissMilliganAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "deal-column" }
  | { type: "auto-move-to-foundation" };

const COLUMN_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const missMilliganRuleset: Ruleset = {
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
    // Only valid descending alt-color sequences can be moved as a group
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

export function initialState(seed: number, settings: MissMilliganSettings): MissMilliganState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 8 columns, 1 face-up card each
  for (let i = 0; i < 8; i++) {
    piles.push({
      id: COLUMN_IDS[i]!,
      kind: "tableau",
      cards: [deck[idx++]!],
      faceUpCount: 1,
    });
  }

  // Stock: remaining 44 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // 4 foundations
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

export function reducer(state: MissMilliganState, action: MissMilliganAction): MissMilliganState {
  if (state.won) return state;

  switch (action.type) {
    case "deal-column": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length < 8) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const newStock = newPiles.find((p) => p.id === "stock")!;

      // Deal one card face-up to each of the 8 columns
      for (const id of COLUMN_IDS) {
        const card = newStock.cards.pop()!;
        const col = newPiles.find((p) => p.id === id)!;
        col.cards.push(card);
        col.faceUpCount = (col.faceUpCount ?? 0) + 1;
      }

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, missMilliganRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
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

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of COLUMN_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, missMilliganRuleset)) {
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
      const total = totalOnFoundations(piles);
      const won = total === 52;

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

export function isTerminal(state: MissMilliganState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

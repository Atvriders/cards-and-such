import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KingsSettings {
  _dummy?: undefined;
}

export interface KingsState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: KingsSettings;
}

export type KingsAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-remove-kings" };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13"] as const;
// 4 "king" foundation slots
const KING_FOUND_IDS = ["k1", "k2", "k3", "k4"] as const;

export const kingsRuleset: Ruleset = {
  canStack: (target, moving) => {
    // King foundations accept Kings only (single card)
    if (target.id.startsWith("k")) {
      if (moving.length !== 1) return false;
      return moving[0]!.rank === 13;
    }
    // Tableau: build up any suit A→K, single card only
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    return card.rank === top.rank + 1;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "tableau") return pile.cards.length > 0;
    return false;
  },
};

export function initialState(seed: number, settings: KingsSettings): KingsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 13 tableau columns × 4 cards each = 52 cards, all face-up
  for (let i = 0; i < 13; i++) {
    const cards = deck.slice(i * 4, (i + 1) * 4);
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
  }

  // 4 king foundations (accept Kings)
  for (const id of KING_FOUND_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return KING_FOUND_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: KingsState, action: KingsAction): KingsState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, kingsRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      const toP = getPile(state.piles, toPile);
      const total = totalOnFoundations(newPiles);
      const won = total === 4; // 4 kings

      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.id.startsWith("k") ? 20 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-remove-kings": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of TABLEAU_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          const top = sourcePile.cards[sourcePile.cards.length - 1]!;
          if (top.rank !== 13) continue;
          for (const foundId of KING_FOUND_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, kingsRuleset)) {
              piles = applyMove(piles, move);
              scoreDelta += 20;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      const won = total === 4;
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

export function isTerminal(state: KingsState): { score: number } | null {
  // Win when all 4 kings are on foundations
  if (totalOnFoundations(state.piles) !== 4) return null;
  return { score: state.score };
}

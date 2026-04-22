import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, klondikeTableauStack } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Canister: 1 deck. 8 tableau columns of alternating 7 and 6 cards (4×7 + 4×6 = 52).
// All face-up. 4 foundations. Build tableau down alternating colors (like Klondike).
// No stock. Sequences can be moved.

export interface CanisterSettings {
  _dummy?: undefined;
}

export interface CanisterState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: CanisterSettings;
}

export type CanisterAction =
  | { type: "move"; fromPile: string; toPile: string; count: number };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4"] as const;

// 4 columns of 7 + 4 columns of 6 = 52
const COLUMN_SIZES = [7, 7, 7, 7, 6, 6, 6, 6] as const;

export const canisterRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    return klondikeTableauStack(target, moving);
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number, settings: CanisterSettings): CanisterState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 8 tableau columns, all face-up
  for (let i = 0; i < 8; i++) {
    const size = COLUMN_SIZES[i]!;
    const cards = deck.slice(idx, idx + size) as Card[];
    idx += size;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: size });
  }

  // 4 foundations (empty)
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

export function reducer(state: CanisterState, action: CanisterAction): CanisterState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, canisterRuleset)) return state;

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

export function isTerminal(state: CanisterState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { isRed, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RankAndFileSettings {
  _dummy?: undefined;
}

export interface RankAndFileState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: RankAndFileSettings;
}

export type RankAndFileAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// Rank and File (aka Dress Parade): 10 tableau columns, 4 foundations
// Like Forty Thieves but: build tableau down in alternating colors (not same suit)
// All 10 columns: 4 cards each, only top card face up
const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const rankAndFileRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length > 1) return false; // one card at a time
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true; // any card to empty
    const top = target.cards[target.cards.length - 1]!;
    // Alternating colors, descending — like Klondike but single card only
    return isRed(top.suit) !== isRed(bottom.suit) && (top.rank as number) === (bottom.rank as number) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    // Only top card (face up)
    return count === 1 && (pile.faceUpCount ?? 0) >= 1;
  },
};

export function initialState(seed: number, settings: RankAndFileSettings): RankAndFileState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 10 columns of 4 cards each: top 1 face up, rest face down
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 4);
    idx += 4;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 1,
    });
  }

  // Stock: remaining 12 cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
  // Waste
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: RankAndFileState, action: RankAndFileAction): RankAndFileState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      // Allow drawing from stock to waste via move from stock to waste
      if (fromPile === "stock" && toPile === "waste") {
        const stock = getPile(state.piles, "stock");
        if (!stock || stock.cards.length === 0) return state;
        const card = stock.cards[stock.cards.length - 1]!;
        const newPiles = state.piles.map((p) => {
          if (p.id === "stock") return { ...p, cards: p.cards.slice(0, -1) };
          if (p.id === "waste") return { ...p, cards: [...p.cards, card] };
          return p;
        });
        return { ...state, piles: newPiles };
      }
      if (!canMove(state.piles, { fromPile, toPile, count }, rankAndFileRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        const sources = [...TABLEAU_IDS, "waste"];
        for (const srcId of sources) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const m = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, m, rankAndFileRuleset)) {
              piles = applyMove(piles, m);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      return { ...state, piles, movesMade: moves, score: total, won: total === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RankAndFileState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

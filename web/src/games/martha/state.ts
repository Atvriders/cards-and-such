import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MarthaSettings {
  _dummy?: undefined;
}

export interface MarthaState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: MarthaSettings;
}

export type MarthaAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/**
 * Martha: Klondike variant where tableau builds down in same suit (not alternating color).
 * Otherwise similar to standard Klondike.
 */
export const marthaRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    const bottom = moving[0];
    if (!bottom) return false;
    if (target.cards.length === 0) return bottom.rank === 13; // Kings to empty
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, descending
    return top.suit === bottom.suit && (top.rank as number) === (bottom.rank as number) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      return count <= faceUp;
    }
    return false;
  },
};

export function initialState(seed: number, settings: MarthaSettings): MarthaState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // Martha deals like standard Klondike: columns 1-7 with 1-7 cards, top face up
  // But also deals 3 extra face-up cards to each tableau (similar to Westcliff variant)
  // Actually, Martha: deal Klondike-style but deal 3 face-up cards to each column on top
  // Standard Martha: 7 cols, standard Klondike layout, draw 1
  for (let i = 0; i < 7; i++) {
    const count = i + 1;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 1,
    });
  }

  // Additional 3 face-up cards dealt to each tableau column
  for (let i = 0; i < 7; i++) {
    const tab = piles.find((p) => p.id === TABLEAU_IDS[i]!)!;
    for (let j = 0; j < 3; j++) {
      if (idx < deck.length) {
        tab.cards.push(deck[idx++]!);
        tab.faceUpCount = (tab.faceUpCount ?? 0) + 1;
      }
    }
  }

  // Stock: remaining
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });
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

export function reducer(state: MarthaState, action: MarthaAction): MarthaState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
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

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || stock.cards.length > 0 || !waste || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: [...waste.cards].reverse() };
        if (p.id === "waste") return { ...p, cards: [] };
        return p;
      });
      return { ...state, piles: newPiles };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, marthaRuleset)) return state;
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
            if (canMove(piles, m, marthaRuleset)) {
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

export function isTerminal(state: MarthaState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

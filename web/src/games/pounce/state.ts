import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PounceSettings {
  _dummy?: undefined;
}

export interface PounceState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: PounceSettings;
}

export type PounceAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const pounceRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "waste" || pile.kind === "stock") return true;
    if (pile.kind === "foundation") return true;
    if (pile.kind === "tableau") return pile.cards.length > 0; // pounce pile
    return false;
  },
};

export function initialState(seed: number, settings: PounceSettings): PounceState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Pounce pile: 13 cards face-down except top
  const pounceCards = deck.slice(0, 13);
  piles.push({ id: "pounce", kind: "tableau", cards: pounceCards, faceUpCount: 1 });

  // Stock: remaining 39 cards (draw 3)
  const stockCards = deck.slice(13);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

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

export function reducer(state: PounceState, action: PounceAction): PounceState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length === 0) return state;
      // Draw up to 3 cards
      const drawCount = Math.min(3, stock.cards.length);
      const drawn = stock.cards.slice(stock.cards.length - drawCount).reverse();
      const newStock = stock.cards.slice(0, stock.cards.length - drawCount);
      const waste = getPile(state.piles, "waste");
      const newWaste = [...(waste?.cards ?? []), ...drawn];

      const newPiles = state.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: newStock };
        if (p.id === "waste") return { ...p, cards: newWaste };
        return p;
      });
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || stock.cards.length > 0) return state;
      if (!waste || waste.cards.length === 0) return state;
      const newPiles = state.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: [...waste.cards].reverse() };
        if (p.id === "waste") return { ...p, cards: [] };
        return p;
      });
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, pounceRuleset)) return state;

      const newPiles = applyMove(state.piles, move);
      // Reveal next pounce card
      const finalPiles = newPiles.map((p) => {
        if (p.id === "pounce" && p.cards.length > 0 && (p.faceUpCount ?? 0) === 0) {
          return { ...p, faceUpCount: 1 };
        }
        return p;
      });

      const toP = getPile(state.piles, toPile);
      const total = totalOnFoundations(finalPiles);
      const pounce = finalPiles.find((p) => p.id === "pounce");
      const won = total === 52 || (pounce?.cards.length === 0);

      return {
        ...state,
        piles: finalPiles,
        score: state.score + (toP?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;
      const sources = ["pounce", "waste"];

      while (moved) {
        moved = false;
        for (const sourceId of sources) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, pounceRuleset)) {
              piles = applyMove(piles, move);
              // Reveal next pounce card
              piles = piles.map((p) => {
                if (p.id === "pounce" && p.cards.length > 0 && (p.faceUpCount ?? 0) === 0) {
                  return { ...p, faceUpCount: 1 };
                }
                return p;
              });
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
      const pounce = piles.find((p) => p.id === "pounce");
      const won = total === 52 || (pounce?.cards.length === 0);
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

export function isTerminal(state: PounceState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}

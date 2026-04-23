import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AlhambraSettings {
  _dummy?: undefined;
}

export interface AlhambraState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: AlhambraSettings;
}

export type AlhambraAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 2 decks = 104 cards
// 4 up-foundations (A→K), 4 down-foundations (K→A)
// 4 tableau columns of 3 cards each (reserve), actually spec says 4 cols × 3
const UP_FOUND_IDS = ["fu1", "fu2", "fu3", "fu4"] as const;
const DN_FOUND_IDS = ["fd1", "fd2", "fd3", "fd4"] as const;
const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;

function downFoundationStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === 13;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && rankVal(c) === rankVal(top) - 1;
}

export const alhambraRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.id.startsWith("fu")) return foundationStack(target, moving);
    if (target.id.startsWith("fd")) return downFoundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Alternating colors, up or down by 1
    const redTop = top.suit === "♥" || top.suit === "♦";
    const redCard = card.suit === "♥" || card.suit === "♦";
    if (redTop === redCard) return false;
    return Math.abs(rankVal(card) - rankVal(top)) === 1;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "tableau") return pile.cards.length > 0;
    if (pile.kind === "foundation") return true;
    return false;
  },
};

export function initialState(seed: number, settings: AlhambraSettings): AlhambraState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(2), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 4 tableau columns × 3 cards = 12 cards (reserve/layout)
  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 3 });
  }

  // 4 up-foundations (empty)
  for (const id of UP_FOUND_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }
  // 4 down-foundations (empty)
  for (const id of DN_FOUND_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  // Stock: remaining 92 cards
  const stockCards = deck.slice(idx);
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return [...UP_FOUND_IDS, ...DN_FOUND_IDS].reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: AlhambraState, action: AlhambraAction): AlhambraState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;

      // Handle draw from stock
      if (fromPile === "stock" && toPile === "waste") {
        const stock = getPile(state.piles, "stock");
        if (!stock || stock.cards.length === 0) {
          // Recycle waste back to stock
          const waste = getPile(state.piles, "waste");
          if (!waste || waste.cards.length === 0) return state;
          const newPiles = state.piles.map((p) => {
            if (p.id === "stock") return { ...p, cards: [...waste.cards].reverse() };
            if (p.id === "waste") return { ...p, cards: [] };
            return p;
          });
          return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
        }
        const newPiles = state.piles.map((p) => {
          if (p.id === "stock") return { ...p, cards: p.cards.slice(0, -1) };
          if (p.id === "waste") return { ...p, cards: [...p.cards, stock.cards[stock.cards.length - 1]!] };
          return p;
        });
        return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
      }

      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, alhambraRuleset)) return state;
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
      const allFoundIds = [...UP_FOUND_IDS, ...DN_FOUND_IDS];
      const sources = [...TABLEAU_IDS, "waste"];

      while (moved) {
        moved = false;
        for (const sourceId of sources) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of allFoundIds) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, alhambraRuleset)) {
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

export function isTerminal(state: AlhambraState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 104) return null;
  return { score: state.score };
}

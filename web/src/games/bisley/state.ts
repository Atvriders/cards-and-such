import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import type { Card, Suit } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BisleySettings {
  _dummy?: undefined;
}

export interface BisleyState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: BisleySettings;
}

export type BisleyAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 4 up-foundations (A→K) + 4 down-foundations (K→A) + 12 tableau columns
const UP_FOUND_IDS = ["fu1", "fu2", "fu3", "fu4"] as const;   // A→K same suit
const DN_FOUND_IDS = ["fd1", "fd2", "fd3", "fd4"] as const;   // K→A same suit
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;

/** Can a card land on a down-foundation? King first, then descend same-suit */
function downFoundationStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === 13; // King starts it
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && rankVal(c) === rankVal(top) - 1;
}

export const bisleyRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.id.startsWith("fu")) return foundationStack(target, moving);
    if (target.id.startsWith("fd")) return downFoundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    if (top.suit !== card.suit) return false;
    // same suit: can go up OR down by 1
    return Math.abs(rankVal(card) - rankVal(top)) === 1;
  },
  canPickUp: (pile, count) => {
    if (count !== 1) return false;
    if (pile.kind === "foundation") return true;
    if (pile.kind === "tableau") return pile.cards.length > 0;
    return false;
  },
};

export function initialState(seed: number, settings: BisleySettings): BisleyState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Auto-place all 4 Aces on up-foundations
  const aceCards: Card[] = [];
  const remaining: Card[] = [];
  for (const card of deck) {
    if (card.rank === 1) aceCards.push(card);
    else remaining.push(card);
  }

  // Sort aces by suit order to match fu1..fu4 / fd1..fd4
  const suitOrder = Object.fromEntries(SUITS.map((s, i) => [s, i])) as Record<Suit, number>;
  aceCards.sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit]);

  const piles: Pile[] = [];

  // Up-foundations with Aces
  for (let i = 0; i < 4; i++) {
    piles.push({ id: UP_FOUND_IDS[i]!, kind: "foundation", cards: [aceCards[i]!] });
  }
  // Down-foundations empty (Kings will start them)
  for (let i = 0; i < 4; i++) {
    piles.push({ id: DN_FOUND_IDS[i]!, kind: "foundation", cards: [] });
  }

  // 12 tableau columns × 4 cards each (48 remaining cards)
  for (let i = 0; i < 12; i++) {
    const cards = remaining.slice(i * 4, (i + 1) * 4);
    piles.push({ id: TABLEAU_IDS[i]!, kind: "tableau", cards, faceUpCount: 4 });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function totalOnFoundations(piles: Pile[]): number {
  return [...UP_FOUND_IDS, ...DN_FOUND_IDS].reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: BisleyState, action: BisleyAction): BisleyState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, bisleyRuleset)) return state;
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
      const allFoundIds = [...UP_FOUND_IDS, ...DN_FOUND_IDS];

      while (moved) {
        moved = false;
        for (const sourceId of TABLEAU_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          for (const foundId of allFoundIds) {
            const move = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, move, bisleyRuleset)) {
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
      const won = totalOnFoundations(piles) === 52;
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

export function isTerminal(state: BisleyState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

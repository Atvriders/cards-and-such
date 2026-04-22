import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Simple Simon: 1 deck, 10 columns (distribution: 3,3,3,3,3,3,8,8,8,8 = 52 cards).
// No stock, no foundations initially. Build K→A same-suit on tableau.
// Complete same-suit K→A sequences auto-remove to foundations.
// Only valid same-suit sequences can be moved as groups.

export interface SimpleSimonSettings {
  _dummy?: undefined;
}

export interface SimpleSimonState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: SimpleSimonSettings;
}

export type SimpleSimonAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-complete" };

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"] as const;
const FOUNDATION_IDS = ["f1","f2","f3","f4"] as const;

// Check if the top N cards of a pile form a same-suit descending sequence
function isSameSuitSequence(cards: Card[], n: number): boolean {
  if (n <= 0) return false;
  const slice = cards.slice(cards.length - n);
  for (let i = 1; i < slice.length; i++) {
    const prev = slice[i - 1]!;
    const curr = slice[i]!;
    if (prev.suit !== curr.suit) return false;
    if (rankVal(prev) !== rankVal(curr) + 1) return false;
  }
  return true;
}

export { isSameSuitSequence };

export const simpleSimonRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") {
      // Auto-complete: accept K→A same-suit sequence of 13 cards
      if (moving.length !== 13) return false;
      if (!isSameSuitSequence(moving, 13)) return false;
      // Sequence starts with K
      if (moving[0]!.rank !== 13) return false;
      return target.cards.length === 0;
    }
    if (target.kind !== "tableau") return false;
    // Moving must be a same-suit sequence
    if (!isSameSuitSequence(moving, moving.length)) return false;
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true; // empty accepts any valid sequence
    const top = target.cards[target.cards.length - 1]!;
    // Top of destination rank must be 1 higher than bottom of sequence
    return rankVal(top) === rankVal(bottom) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "tableau") {
      const faceUp = pile.faceUpCount ?? 0;
      if (count > faceUp) return false;
      return isSameSuitSequence(pile.cards, count);
    }
    return false;
  },
};

// Column sizes: first 6 get 3 cards, last 4 get 8 cards (total 6*3 + 4*8 = 18 + 32 = 50... not 52)
// Let's use: first 4 columns get 3 each = 12, next 2 columns get 4 each = 8, last 4 get 8 each = 32 → total = 52
// Standard Simple Simon: col 1-4 get 3, col 5-6 get 4, col 7-10 get 8 — wait that's 12+8+32=52 ✓
const COLUMN_SIZES = [3, 3, 3, 3, 4, 4, 8, 8, 8, 8] as const; // total = 52

export function initialState(seed: number, settings: SimpleSimonSettings): SimpleSimonState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 10 tableau columns, all face-up
  for (let i = 0; i < 10; i++) {
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

// Check tableau for complete K→A same-suit sequences and auto-remove them
function autoRemoveSequences(piles: Pile[]): Pile[] {
  let result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  let changed = true;
  while (changed) {
    changed = false;
    for (const tabId of TABLEAU_IDS) {
      const tab = result.find((p) => p.id === tabId);
      if (!tab || tab.cards.length < 13) continue;
      // Check top 13 cards
      const top13 = tab.cards.slice(tab.cards.length - 13);
      // Must be K→A same-suit
      if (top13[0]!.rank !== 13) continue;
      if (!isSameSuitSequence(top13, 13)) continue;
      // Find an empty foundation
      const foundationId = FOUNDATION_IDS.find((fid) => {
        const f = result.find((p) => p.id === fid);
        return f && f.cards.length === 0;
      });
      if (!foundationId) continue;
      // Move sequence to foundation
      const foundation = result.find((p) => p.id === foundationId)!;
      const removed = tab.cards.splice(tab.cards.length - 13, 13);
      foundation.cards.push(...removed);
      tab.faceUpCount = Math.max(0, (tab.faceUpCount ?? 0) - 13);
      // If remaining cards and faceUpCount would be 0, reveal top
      if (tab.cards.length > 0 && (tab.faceUpCount ?? 0) === 0) {
        tab.faceUpCount = 1;
      }
      changed = true;
      break;
    }
  }
  return result;
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: SimpleSimonState, action: SimpleSimonAction): SimpleSimonState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, simpleSimonRuleset)) return state;

      let newPiles = applyMove(state.piles, move);
      // Auto-remove any complete K→A same-suit sequences
      newPiles = autoRemoveSequences(newPiles);

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 100 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-complete": {
      const newPiles = autoRemoveSequences(state.piles);
      if (newPiles === state.piles) return state;
      const total = totalOnFoundations(newPiles);
      const won = total === 52;
      return { ...state, piles: newPiles, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SimpleSimonState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

// Export suit constant for use in tests
export { SUITS };
export type { Suit, Rank };

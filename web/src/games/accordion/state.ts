import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { accordionSettings } from "./index.js";

export type AccordionSettings = SettingsOf<typeof accordionSettings>;

export interface AccordionState {
  /** Each pile is a stack of cards (last card is on top/visible). Position = index in array. */
  piles: Card[][];
  score: number;
  movesMade: number;
  won: boolean;
  settings: AccordionSettings;
}

export type AccordionAction =
  | { type: "move"; fromIndex: number; toIndex: number };

function cardMatches(a: Card, b: Card): boolean {
  return a.suit === b.suit || a.rank === b.rank;
}

export function legalMoves(piles: Card[][], allowJump3: boolean): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < piles.length; i++) {
    if (piles[i]!.length === 0) continue;
    const topI = piles[i]![piles[i]!.length - 1]!;
    // Check adjacent (i-1) and 3-away (i-3)
    const targets = [i - 1];
    if (allowJump3) targets.push(i - 3);
    for (const j of targets) {
      if (j < 0 || piles[j] === undefined || piles[j]!.length === 0) continue;
      const topJ = piles[j]![piles[j]!.length - 1]!;
      if (cardMatches(topI, topJ)) {
        moves.push({ from: i, to: j });
      }
    }
  }
  return moves;
}

export function initialState(seed: number, settings: AccordionSettings): AccordionState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Each card starts as its own pile of 1
  const piles: Card[][] = deck.map((c) => [c]);

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

export function reducer(state: AccordionState, action: AccordionAction): AccordionState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromIndex, toIndex } = action;
      const piles = state.piles;

      if (fromIndex < 0 || fromIndex >= piles.length) return state;
      if (toIndex < 0 || toIndex >= piles.length) return state;
      if (piles[fromIndex]!.length === 0) return state;
      if (piles[toIndex]!.length === 0) return state;

      const allowJump3 = state.settings.allowJump3;
      const diff = fromIndex - toIndex;
      if (diff !== 1 && !(allowJump3 && diff === 3)) return state;

      const topFrom = piles[fromIndex]![piles[fromIndex]!.length - 1]!;
      const topTo = piles[toIndex]![piles[toIndex]!.length - 1]!;
      if (!cardMatches(topFrom, topTo)) return state;

      // Move all cards from fromIndex onto toIndex, then remove fromIndex
      const newPiles = piles.map((p) => [...p]);
      newPiles[toIndex]!.push(...newPiles[fromIndex]!);
      newPiles[fromIndex] = [];
      // Compact: remove empty piles
      const compacted = newPiles.filter((p) => p.length > 0);

      const won = compacted.length === 1;

      return {
        ...state,
        piles: compacted,
        movesMade: state.movesMade + 1,
        score: won ? 100 : Math.max(0, 52 - compacted.length),
        won,
        settings: state.settings,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: AccordionState): { score: number } | null {
  if (state.won) return { score: state.score };
  // Also terminal if no legal moves remain
  const moves = legalMoves(state.piles, state.settings.allowJump3);
  if (moves.length === 0 && state.piles.length > 1) return { score: state.score };
  return null;
}

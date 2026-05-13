import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type {
  SequenceFullState,
  SequenceFullAction,
  SequenceFullSettings,
} from "./state.js";
import {
  initialState,
  reducer,
  isTerminal,
  BOARD_LABELS,
  isOneEyedJack,
  isTwoEyedJack,
  cellsForCard,
  BOARD_SIZE,
} from "./state.js";

const SequenceFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.SequenceFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: {
    kind: "boolean" as const,
    label: "Reserved",
    default: false,
  },
} as const;

export const sequenceFullPlugin: GamePlugin<SequenceFullState, SequenceFullAction, typeof settings> = {
  id: "sequence-full",
  title: "Sequence (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Play cards from your hand to claim corresponding board spaces; first to two five-in-a-row sequences wins.",
  howToPlay: `Sequence is a card-driven 5-in-a-row game on a 10x10 board. Each cell (except the four corners) is labeled with a playing card; every non-Jack card from a standard 52-card deck appears on the board twice. The four corners are FREE spaces that count for any player's sequence touching them.

Both you and the CPU start with a 7-card hand drawn from two combined 52-card decks (104 cards, no jokers).

On your turn: tap a card in your hand, then tap a matching empty board space to place your chip. You then automatically draw a replacement card.

Jacks are special: the two-eyed Jacks (J of Diamonds and J of Clubs) are WILD — tap one then any empty non-corner space to place a chip there. The one-eyed Jacks (J of Spades and J of Hearts) are ANTI-WILD — tap one, then tap an opponent's chip to remove it. You cannot remove a chip that is part of an already-completed sequence (those chips are protected, indicated by a gold outline).

If both copies of one of your cards are already covered, the card is "dead" and useless — select it and tap "Discard dead card" to swap it for a fresh draw at no other cost.

The goal: complete two sequences of five chips in a row (horizontal, vertical, or diagonal). The first player to claim TWO sequences wins. The four corners count as a wild "chip" for sequence purposes, so a line of 4 chips touching a corner counts as a sequence. A single chip may be shared between two of your own sequences (one overlap), but no more.

CPU strategy: the CPU prefers plays that complete or extend its own runs, blocks any of your runs of length 3+, and otherwise plays randomly among legal moves. It will also use one-eyed Jacks to break up your longest unprotected lines.`,
  settings,
  initialState: (seed: number, s: SequenceFullSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "select-remove") {
      // Pulse the first removable opponent chip.
      for (let i = 0; i < state.board.length; i++) {
        if (state.board[i] === 1 && state.lockedFor[i] !== 1) {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          return { selector: `[data-testid="sf-cell-${r}-${c}"]`, pulses: 3 };
        }
      }
      return null;
    }
    // No card selected yet: pulse the first non-dead card in hand.
    if (state.selectedHandIdx === null) {
      for (let i = 0; i < state.hands[0].length; i++) {
        const card = state.hands[0][i]!;
        if (card.rank === "J") return { selector: `[data-testid="sf-hand-${i}"]`, pulses: 3 };
        const empty = cellsForCard(card).some((ci) => state.board[ci] === null);
        if (empty) return { selector: `[data-testid="sf-hand-${i}"]`, pulses: 3 };
      }
      return null;
    }
    // Card selected: pulse a legal target cell.
    const card = state.hands[0][state.selectedHandIdx];
    if (!card) return null;
    if (isOneEyedJack(card)) {
      for (let i = 0; i < state.board.length; i++) {
        if (state.board[i] === 1 && state.lockedFor[i] !== 1) {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          return { selector: `[data-testid="sf-cell-${r}-${c}"]`, pulses: 3 };
        }
      }
      return null;
    }
    if (isTwoEyedJack(card)) {
      for (let i = 0; i < state.board.length; i++) {
        if (state.board[i] === null && !BOARD_LABELS[i]!.isFree) {
          const r = Math.floor(i / BOARD_SIZE);
          const c = i % BOARD_SIZE;
          return { selector: `[data-testid="sf-cell-${r}-${c}"]`, pulses: 3 };
        }
      }
      return null;
    }
    for (const ci of cellsForCard(card)) {
      if (state.board[ci] === null) {
        const r = Math.floor(ci / BOARD_SIZE);
        const c = ci % BOARD_SIZE;
        return { selector: `[data-testid="sf-cell-${r}-${c}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: SequenceFull,
};

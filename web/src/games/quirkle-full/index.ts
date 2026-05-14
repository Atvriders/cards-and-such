import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { QwirkleState, QwirkleAction, QwirkleSettings } from "./state.js";
import { initialState, reducer, isTerminal, keyOf } from "./state.js";

const QwirkleFullGameLazy = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.QwirkleFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

export const quirkleFullPlugin: GamePlugin<QwirkleState, QwirkleAction, typeof settings> = {
  id: "quirkle-full",
  title: "Qwirkle (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Tile-laying with 6 colors and 6 shapes — match a row by color OR shape; +6 bonus for a six-tile Qwirkle.",
  howToPlay: `Qwirkle (Full) is an abstract tile-laying game. You play against two CPU opponents (You, CPU 1, CPU 2). The bag contains 108 tiles: 6 colors x 6 shapes, 3 copies of each. Each player starts with a hand of 6 tiles.

On your turn, place one or more tiles in a single line (all in the same row OR all in the same column). Every line of two-or-more tiles that touches a tile you placed must be a valid Qwirkle line: all tiles share the SAME COLOR with DIFFERENT SHAPES, OR all tiles share the SAME SHAPE with DIFFERENT COLORS. No duplicates allowed in a line, maximum line length is 6 tiles.

To play: tap a tile in your hand to select it, then tap an empty board cell to place it. Tap a placed pending tile to recall it. Press Submit to commit the move and draw replacement tiles up to 6. Press Recall to return all pending tiles to your hand. Press Swap Hand to trade your entire hand for new tiles from the bag (uses your turn — requires at least one tile in the bag).

Scoring: each new line you create or extend scores 1 point per tile in the line (including existing tiles). Completing a 6-tile line — a Qwirkle — earns a +6 bonus on top.

End of game: when the bag is empty and a player runs out of tiles, the game ends immediately. The player who emptied their hand last earns a +6 final bonus. Highest score wins.

CPU strategy: each CPU plays a greedy highest-scoring placement. It enumerates every legal single-tile placement at every anchor cell, then tries to extend the best seeds along the play direction with additional matching tiles. If no legal move exists it swaps its full hand (or passes if the bag is empty).

Your final reported score = your tile points + a win bonus (25 plus margin over the runner-up). A loss or tie reports 0.`,
  settings,
  initialState: (seed: number, s: QwirkleSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: QwirkleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    const current = state.players[state.currentPlayer];
    if (!current || current.isCpu) return null;
    // If a tile is selected, pulse a plausible empty cell — pick the first
    // adjacent empty cell on the board, or origin if board is empty.
    if (state.selectedHandIdx !== null) {
      // If board empty, pulse origin
      if (Object.keys(state.board).length === 0) {
        return { selector: `[data-testid="quirkle-full-cell-0-0"]`, pulses: 3 };
      }
      // Find an anchor (empty cell adjacent to existing tile)
      for (const k of Object.keys(state.board)) {
        const [r, c] = k.split(",").map(Number);
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = r! + dr!;
          const nc = c! + dc!;
          if (!state.board[keyOf(nr, nc)] && !state.pending.some((p) => p.r === nr && p.c === nc)) {
            return {
              selector: `[data-testid="quirkle-full-cell-${nr}-${nc}"]`,
              pulses: 3,
            };
          }
        }
      }
    }
    // Else: pulse the first unused hand tile
    for (let i = 0; i < current.hand.length; i++) {
      if (state.pending.some((p) => p.handIdx === i)) continue;
      return { selector: `[data-testid="quirkle-full-hand-${i}"]`, pulses: 3 };
    }
    if (state.pending.length > 0) {
      return { selector: `[data-testid="quirkle-full-submit"]`, pulses: 3 };
    }
    return null;
  },
  component: QwirkleFullGameLazy,
};

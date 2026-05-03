import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { PentagoState, PentagoAction, PentagoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Pentago = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Pentago as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const pentagoPlugin: GamePlugin<PentagoState, PentagoAction, typeof settings> = {
  id: "pentago",
  title: "Pentago",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place marbles and rotate quadrants to get five in a row.",
  howToPlay: `Pentago is played on a 6×6 board divided into four 3×3 quadrants. You play as Black and the bot plays as White. The goal is to be the first to get five of your marbles in an unbroken row — horizontally, vertically, or diagonally.

Each turn has two steps. First, click any empty cell to place your marble. Second, choose a quadrant and a direction (clockwise or counter-clockwise) to rotate it 90°. The rotation buttons appear automatically after you place. The bot performs both steps automatically.

Winning: five in a row is checked after the rotation. If both players achieve five in a row simultaneously due to the rotation, the game is a draw.

The twist: a rotation that would otherwise block your opponent might also extend your own row — or break it! Thinking ahead about what your opponent's rotations can do to your plans is essential.

Bot strategy: the bot uses minimax at depth 2, evaluating positions by counting open sequences of 2, 3, and 4 marbles. It slightly prioritises blocking your threats over building its own sequences.

Tips: placing near the middle of a quadrant gives you the most flexible lines. Be careful — rotating a quadrant can scatter your own carefully built sequences. Try to build multiple threats at once so the bot can't block them all.`,
  settings,
  initialState: (seed: number, s: PentagoSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    if (state.phase !== "place") return null;
    for (let i = 0; i < 36; i++) {
      if (state.board[i] === null) {
        const row = Math.floor(i / 6), col = i % 6;
        return { selector: `[data-testid="pent-${row}-${col}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: Pentago,
};

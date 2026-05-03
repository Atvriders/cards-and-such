import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { BlokusDuoState, BlokusDuoAction, BlokusDuoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BlokusDuo = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BlokusDuo as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const blokusDuoPlugin: GamePlugin<BlokusDuoState, BlokusDuoAction, typeof settings> = {
  id: "blokus-duo",
  title: "Blokus Duo",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place polyomino pieces corner-to-corner to fill the 14×14 board.",
  howToPlay: `Blokus Duo is a two-player abstract strategy game played on a 14×14 board. You play as Blue and the bot plays as Red. Each player has 21 polyomino pieces — shapes made of 1 to 5 squares.

To place a piece, select it from your tray (the piece grid below the board), optionally rotate it with the Rotate button, then click the board cell where you want its top-left corner to go.

Rules for placement: your first piece must cover your starting cell (the lightly coloured cell in your quadrant). Every subsequent piece must touch at least one of your already-placed pieces at a corner — diagonally — but must NEVER touch your own pieces along a shared edge. You may overlap corners with the opponent's pieces.

When a player has no legal placement available, they are eliminated. The game ends when neither player can place any more pieces. The player with fewer remaining squares (by total area of unplaced pieces) wins. If tied, the game is a draw.

Bot strategy: the bot greedily plays the largest available piece that it can legally place, preferring central positions to maximise future flexibility.

Tips: try to cover your corner point early and branch in multiple directions. Control the center of the board to keep your options open. Saving small 1- or 2-square pieces for the endgame lets you fill tight gaps where larger pieces no longer fit.`,
  settings,
  initialState: (seed: number, s: BlokusDuoSettings) => initialState(seed, s),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    if (!state.hasPlaced[0]) {
      return { selector: '[data-testid="blk-4-4"]', pulses: 3 };
    }
    return null;
  },
  component: BlokusDuo,
};

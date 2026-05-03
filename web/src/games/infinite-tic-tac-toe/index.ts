import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { InfiniteTTTState, InfiniteTTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const InfiniteTTTGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.InfiniteTTTGame as unknown as React.ComponentType<unknown> })));
export const infiniteTTTSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["human", "bot"] as const,
    default: "bot" as const,
  },
} as const;

type InfiniteTTTSettingsType = SettingsOf<typeof infiniteTTTSettings>;

export const infiniteTicTacToePlugin: GamePlugin<InfiniteTTTState, InfiniteTTTAction, typeof infiniteTTTSettings> = {
  id: "infinite-tic-tac-toe",
  title: "Infinite TTT",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tic-tac-toe on a 5×5 board where you need 4-in-a-row — but after 6 pieces each, your oldest vanishes.",
  howToPlay: `Infinite Tic-Tac-Toe plays on a 5×5 grid. The goal is to place four of your pieces in a row — horizontally, vertically, or diagonally. Standard tic-tac-toe only needs three in a row, but the larger board and longer winning condition create a much deeper strategic puzzle.

The twist that makes this game "infinite": each player may have at most 6 pieces on the board at once. When you place a 7th piece, your oldest piece (shown faded with a dashed border) is automatically removed before your new piece appears. This means the game can never stall — the board is always in flux, and long-term positions are never permanent.

The fading piece indicator warns you which of your pieces will disappear on your next turn. Use this strategically: sometimes it is better to sacrifice an old piece in a useful position than to extend a line you can no longer protect.

In bot mode you play as X against a random bot that plays as O. The bot picks randomly among empty cells, so it is possible to outmaneuver it with consistent 4-in-a-row threats. In human mode two players share the same device.

X wins: score 500. Draw: score 200. Losing scores 0.`,
  settings: infiniteTTTSettings,
  initialState: (seed: number, settings: InfiniteTTTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ittt-board")) ? { selector: ".ittt-board", pulses: 3 } : null,
  component: InfiniteTTTGame,
};

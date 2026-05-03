import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FDState, FDAction, FDSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrisianDraughts = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FrisianDraughts as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const frisianDraughtsPlugin: GamePlugin<FDState, FDAction, typeof settings> = {
  id: "frisian-draughts",
  title: "Frisian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dutch draughts variant with orthogonal captures — a harder, faster 10×10 game.",
  howToPlay: `Frisian Draughts is the national game of the Dutch province of Friesland and a distinct variant from International Draughts. It is played on a 10×10 board with 20 pieces per side occupying the dark squares of the first four rows. You play White; the bot plays Black.

The key difference from standard draughts: pieces may capture BOTH diagonally and orthogonally (up, down, left, right). Regular men move diagonally forward but capture in all eight directions. Kings slide any number of squares diagonally or orthogonally and capture along those lines from any distance.

Capture is mandatory. If multiple captures are possible, you must choose the sequence that takes the most pieces. After a capture sequence, if your piece reaches the back row mid-chain, it does NOT become a king until the chain ends.

A man promotes to king upon reaching the opponent's back row at the end of a turn. Kings are powerful pieces — they slide along any line and can capture from a distance.

Win by capturing all opponent pieces or leaving them with no legal moves. The bot plays at depth 3 minimax. Frisian draughts favors aggressive play and long chains.`,
  settings,
  initialState: (seed: number, s: FDSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".fd-board")) ? { selector: ".fd-board", pulses: 3 } : null,
  component: FrisianDraughts,
};

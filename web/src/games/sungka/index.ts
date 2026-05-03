import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SungkaState, SungkaAction, SungkaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sungka = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Sungka as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const sungkaPlugin: GamePlugin<SungkaState, SungkaAction, typeof settings> = {
  id: "sungka",
  title: "Sungka",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Filipino mancala — sow 7-seed pits counterclockwise and capture empty pits.",
  howToPlay: `Sungka is the traditional mancala game of the Philippines, played on a carved wooden boat-shaped board. The board has two rows of seven pits plus two large head (store) pits at each end. Each pit starts with 7 seeds. You play the bottom row; the bot plays the top row.

On your turn, choose one of your seven bottom pits that has seeds. Pick up all its seeds and sow them one by one counterclockwise — moving left to right along your row, then depositing into your own store (the left head), then right to left along the opponent's row, skipping the opponent's store, and continuing around.

Capture rule: if the very last seed you sow lands in a pit on your own side that was empty before that seed landed, you capture all seeds from the directly opposite opponent pit, plus the capturing seed itself, and add them to your store.

Extra turn: if the last seed lands exactly in your own store (head), you take another turn immediately.

The game ends when all pits on one side are empty. The player with the most seeds in their store wins. Click any of your bottom-row pits to sow. The bot plays at depth 4.`,
  settings,
  initialState: (seed: number, s: SungkaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sungka-board")) ? { selector: ".sungka-board", pulses: 3 } : null,
  component: Sungka,
};

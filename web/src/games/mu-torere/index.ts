import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MuTorereState, MuTorereAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MuTorereGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MuTorereGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const muTorerePlugin: GamePlugin<MuTorereState, MuTorereAction, typeof settings> = {
  id: "mu-torere",
  title: "Mu Torere",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Māori star-board game — deadlock your opponent.",
  howToPlay: `Mu Torere is a traditional Māori abstract strategy game from New Zealand. The board has eight outer points called kewai arranged in a star, plus one central space called the putahi. You start with four dark pieces on four adjacent kewai (positions 0–3); the bot's four light pieces occupy the other four (positions 4–7).

On each turn you move one of your pieces to an adjacent empty space. The movement rules are:

From a kewai: you may move to an adjacent kewai (one step around the ring, left or right) if it is empty. You may also move to the putahi if it is empty, but only if at least one of the two kewai adjacent to your piece is occupied by an opponent's piece.

From the putahi: you may move to any empty kewai.

These restrictions prevent the game from ending immediately — the adjacency-to-opponent rule ensures players must intermix before the center can be used freely.

The player who cannot make any legal move loses.

Strategy: try to create configurations where the opponent's pieces are all blocked — unable to move to adjacent kewai (they're occupied) and unable to reach the center without an adjacent opponent. Keeping your pieces together while spreading the opponent's pieces thin is key.

Bot: minimax at depth 4.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".muto-svg")) ? { selector: ".muto-svg", pulses: 3 } : null,
  component: MuTorereGame,
};

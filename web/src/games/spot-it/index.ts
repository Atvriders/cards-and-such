import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpotItState, SpotItAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpotItGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpotItGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const spotItPlugin: GamePlugin<SpotItState, SpotItAction, typeof settings> = {
  id: "spot-it",
  title: "Spot It",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the one matching symbol between two cards before the bot does!",
  howToPlay: `Spot It (also known as Dobble) is a lightning-fast visual perception game. Two cards are shown, each with 8 emoji symbols. Any two cards share exactly ONE symbol in common — your job is to find it first.

The deck is generated using a mathematical structure called a projective plane of order 7, which guarantees that any pair of cards shares exactly one symbol. This is not a coincidence — it's pure geometry!

Each round: two cards appear side by side. Scan both cards visually and click the symbol that appears on BOTH cards. Click it before the bot does! The bot has a random reaction time between 1.5 and 4 seconds per round.

You and the bot each earn one point for each round you win. After 14 rounds, whoever has more points wins.

Score: win = your points × 10, loss = your points × 5.

Tips: instead of reading left-to-right, let your eyes defocus and look for a "pop" — your peripheral vision is faster at noticing visual matches than your focused vision. Symbols vary in size on real cards, but here they are uniform — pure shape recognition.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: SpotItGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HalmaState, HalmaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Halma } from "./Halma.js";

export const halmaSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type HalmaSettingsType = SettingsOf<typeof halmaSettings>;

export const halmaPlugin: GamePlugin<HalmaState, HalmaAction, typeof halmaSettings> = {
  id: "halma",
  title: "Halma",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The predecessor to Chinese Checkers: race 13 pieces from your corner to the opposite corner on a 10×10 board.",
  howToPlay: `Halma is a classic strategy race game invented in the 1880s, and the direct predecessor to Chinese Checkers. It is played on a 10×10 board. You control 13 Red pieces starting in the top-left triangular corner (pink zone). Your goal is to move all of them to the opposite corner (blue zone) before the bot does the same.

On each turn you move one piece. There are two types of moves: a step moves your piece to any adjacent empty square in all 8 directions (horizontally, vertically, or diagonally). A jump leaps over any adjacent piece — yours or the opponent's — landing on the empty square directly behind it. After jumping, you may continue jumping with the same piece in a chain, in any direction, as many times as possible.

You cannot combine a step and a jump in the same turn. Plan your chains in advance — long jump chains can propel pieces across the board quickly. Building "bridges" (columns of pieces) lets multiple pieces hop over each other in sequence.

The first player to fill the opposite corner with all 13 pieces wins. The bot uses a greedy strategy, always advancing its most backward piece toward its goal.

Click a Red piece to select it (highlighted in yellow), then click a green destination to move.`,
  settings: halmaSettings,
  initialState: (seed: number, settings: HalmaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Halma,
};

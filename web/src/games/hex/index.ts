import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HexState, HexAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hex } from "./Game.js";

const settings = {
  size: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["9", "11", "13"] as const,
    default: "11" as const,
  },
  swapRule: {
    kind: "boolean" as const,
    label: "Swap Rule",
    default: true,
  },
} as const;

type HexSettingsType = SettingsOf<typeof settings>;

export const hexPlugin: GamePlugin<HexState, HexAction, typeof settings> = {
  id: "hex",
  title: "Hex",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect your two sides of the rhombic board before your opponent does.",
  howToPlay: `Hex is a two-player connection game played on a rhombic grid of hexagons. You play as Black and must connect the top edge to the bottom edge with a chain of your stones. The bot plays as White and tries to connect the left edge to the right edge. The board sizes are 9×9, 11×11, or 13×13.

Click any empty hexagon to place your Black stone. The bot responds automatically. Unlike most board games, Hex can never end in a draw — one player MUST eventually complete a connection.

Swap Rule: Because the first player has a strong advantage, the swap rule is available. If enabled, after you place your first stone the bot (as second player) may choose to swap sides, claiming your stone as their own. This balances the advantage of going first. In this implementation the bot declines the swap to keep play accessible.

Bot difficulty: The bot uses minimax search at depth 3 with an evaluation based on stone counts and central positioning. On the 11×11 board the search is quite fast; on 13×13 it may take a moment.

Strategy tips: The key skill in Hex is building "bridges" — groups of stones that cannot be blocked. Control the center of the board to maximise your connection options. A chain that spans the board width (or height) wins instantly, so always look for forcing moves that create multiple threats simultaneously.`,
  settings,
  initialState: (seed: number, s: HexSettingsType) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Hex,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaghChalState, BaghChalAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BaghChal } from "./Game.js";

export const baghChalSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type BaghChalSettingsType = SettingsOf<typeof baghChalSettings>;

export const baghChalPlugin: GamePlugin<BaghChalState, BaghChalAction, typeof baghChalSettings> = {
  id: "bagh-chal",
  title: "Bagh Chal",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nepali tigers-and-goats — trap the tigers or they eat your herd.",
  howToPlay: `Bagh Chal (Tigers and Goats) is Nepal's national board game. It is played on a 5×5 intersection board with diagonal connections at even-sum points. The game is deeply asymmetric: you control 20 Goats; the bot controls 4 Tigers placed at the four corners.

The game has two phases. In Phase 1 (Placement) you place your 20 goats one at a time on any empty intersection. After each goat placement the tigers move. In Phase 2 (Movement) all goats have been placed and pieces move one step along any line to an adjacent empty point.

Tigers can capture a goat by jumping over it to the empty intersection directly beyond, along any connected line. The Tigers win if they capture 5 goats. The Goats win if they surround all 4 tigers so none can move or jump.

Click any empty intersection to place a goat. In Phase 2, click a goat to select it, then click a highlighted point to move. The tigers play automatically with a preference for capturing moves.

Scoring: Goats win = 25; Tigers win = 0.`,
  settings: baghChalSettings,
  initialState: (seed: number, settings: BaghChalSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: BaghChal,
};

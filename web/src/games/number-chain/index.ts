import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumberChainState, NumberChainAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberChainGame } from "./Game.js";

const numberChainSettings = {
  size: {
    kind: "number" as const,
    label: "Grid size",
    min: 4,
    max: 6,
    step: 1,
    default: 4,
  },
} as const;

type S = SettingsOf<typeof numberChainSettings>;

export const numberChainPlugin: GamePlugin<NumberChainState, NumberChainAction, typeof numberChainSettings> = {
  id: "number-chain",
  title: "Number Chain",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trace a path through the grid connecting numbers in sequence.",
  howToPlay: `Number Chain fills a grid with several numbered endpoints. Your task is to draw a path that visits each endpoint in numerical order — 1, 2, 3, and so on up to the last number.

Click on the cell showing "1" to begin your path. Then click an adjacent cell (up, down, left, or right — no diagonals) to extend the chain. To step back, click the cell immediately before the head of your path.

The path must pass through every numbered cell in sequence. You cannot skip a number and return to it later. If you get stuck, click "Reset Path" to start over from the beginning.

You win when your path reaches the final endpoint number in order. Grid sizes range from 4×4 (beginner) to 6×6 (expert). Larger grids have more waypoints and longer required paths.

Score starts at 1000 and decreases by 5 per move made, with a floor of 100. Moving back and forth wastes moves, so plan the route mentally before starting.

Tip: Before clicking, trace the required path with your eyes. Numbered endpoints are placed along a valid solution path, so a route always exists — the challenge is finding it efficiently.`,
  settings: numberChainSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: NumberChainGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KyodaiState, KyodaiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Kyodai = /* @__PURE__ */ lazy(() => import("./Kyodai.js").then((mod) => ({ default: mod.Kyodai as unknown as React.ComponentType<unknown> })));
export const kyodaiSettings = {
  shuffle: {
    kind: "boolean" as const,
    label: "Shuffle on Deadlock",
    default: true,
  },
} as const;

type KyodaiSettingsType = SettingsOf<typeof kyodaiSettings>;

export const kyodaiPlugin: GamePlugin<KyodaiState, KyodaiAction, typeof kyodaiSettings> = {
  id: "kyodai",
  title: "Kyodai (Mahjong Connect)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match pairs of identical mahjong tiles connected by a path with no more than two turns.",
  howToPlay: `Kyodai is a connection-style matching game played on a 12×8 grid packed with mahjong tiles. Every tile on the board has exactly one matching twin somewhere else on the grid.

Click a tile to select it (it glows with a white outline), then click its matching twin. The two tiles are removed only if a clear path connects them. The path must be made of straight horizontal or vertical lines and can make at most two right-angle turns. The path cannot pass through other tiles.

Think of the path as having up to three segments: one straight section from the first tile, a connecting horizontal or vertical corridor, and a final straight section to the second tile. If you cannot find a direct or L-shaped connection, look for a U-shaped route that travels around the edges of the tile cluster.

Plan ahead — removing certain pairs first opens up paths for harder-to-reach pairs. The board is cleared when every pair is matched. The game ends early if no more valid connections exist and no moves are possible.

Score 100 points per pair matched, plus a 500-point bonus for clearing the entire board.`,
  settings: kyodaiSettings,
  initialState: (seed: number, settings: KyodaiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".kyodai-board")) ? { selector: ".kyodai-board", pulses: 3 } : null,
  component: Kyodai,
};

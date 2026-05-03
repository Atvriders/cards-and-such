import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HexMatchState, HexMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HexMatch3 = /* @__PURE__ */ lazy(() => import("./HexMatch3.js").then((mod) => ({ default: mod.HexMatch3 as unknown as React.ComponentType<unknown> })));
export const hexMatch3Settings = {
  radius: {
    kind: "enum" as const,
    label: "Grid Radius",
    options: ["3", "4"] as const,
    default: "4" as const,
  },
} as const;

type HexMatch3SettingsType = SettingsOf<typeof hexMatch3Settings>;

export const hexMatch3Plugin: GamePlugin<HexMatchState, HexMatchAction, typeof hexMatch3Settings> = {
  id: "hex-match-3",
  title: "Hexa Match 3",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Swap adjacent hexagonal tiles to match 3 or more in a line. Score points before your moves run out.",
  howToPlay: `Hexa Match 3 is played on a honeycomb grid made up of colored hexagonal tiles. Click a tile to select it (it glows brightly), then click one of its six immediate neighbors to swap the two tiles.

After a swap, the board checks every row direction on the hex grid — there are three line directions: flat-side-to-flat-side, and both diagonals. If three or more tiles of the same color form a continuous line in any direction, they all count as a match. Matched tiles score 10 points each and are immediately replaced with new random tiles.

If your swap does not create a match of three or more, the swap is cancelled and neither tile moves. You must make a valid matching swap to use a move.

You have 30 moves. Plan each swap carefully — sometimes setting up a longer chain of 4 or 5 matching tiles in a single swap is much more efficient than making many smaller two-tile matches. Look along all three hex-grid directions before committing to a swap.

The game ends when your moves are exhausted. Try to maximize your score before time runs out.`,
  settings: hexMatch3Settings,
  initialState: (seed: number, settings: HexMatch3SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".hexmatch-grid")) ? { selector: ".hexmatch-grid", pulses: 3 } : null,
  component: HexMatch3,
};

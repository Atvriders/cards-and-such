import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RummikubState, RummikubAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Rummikub = /* @__PURE__ */ lazy(() => import("./Rummikub.js").then((mod) => ({ default: mod.Rummikub as unknown as React.ComponentType<unknown> })));
export const rummikubSettings = {
  botCount: {
    kind: "enum" as const,
    label: "Bot Players",
    options: ["1", "2"] as const,
    default: "1",
  },
} as const;

type RummikubSettingsType = SettingsOf<typeof rummikubSettings>;

export const rummikubPlugin: GamePlugin<RummikubState, RummikubAction, typeof rummikubSettings> = {
  id: "rummikub",
  title: "Rummikub",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile-melding race — form runs and groups before your opponents.",
  howToPlay: `Rummikub uses 106 tiles: two sets of numbers 1–13 in four colours (red, blue, orange, black) plus two jokers. Each player starts with 14 tiles. The goal is to be the first to play all your tiles onto the table.

On your turn you can do any combination of the following: select tiles in your hand and click "Meld" to place a valid group on the table, or click "Draw Tile" to take a tile from the pool. Click "End Turn" when done.

Valid melds: a Group is 3–4 tiles of the same number in different colours. A Run is 3 or more consecutive numbers in the same colour (e.g., red 5-6-7). Jokers can stand in for any tile in a meld.

After your turn, bots automatically take their turns. The bot looks for groups in its hand and plays them.

Click tiles in your hand to select them (they lift up). Select 3 or more and click "Meld Selected." The game validates the meld and places it on the table. If invalid, a message explains why.

Scoring: win score = sum of tile values remaining in opponents' hands. Loss = 0.

Tips: Concentrate on getting rid of high-value tiles early (they count against you if an opponent wins). Look for overlapping melds — the same tile can appear in only one group, so plan ahead.`,
  settings: rummikubSettings,
  initialState: (seed: number, settings: RummikubSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".rummikub-btn", pulses: 3 }; },
  component: Rummikub,
};

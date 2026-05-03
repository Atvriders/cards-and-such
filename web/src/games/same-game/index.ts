import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SameGameState, SameGameAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SameGame = /* @__PURE__ */ lazy(() => import("./SameGame.js").then((mod) => ({ default: mod.SameGame as unknown as React.ComponentType<unknown> })));
export const sameGameSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

type SameGameSettingsType = SettingsOf<typeof sameGameSettings>;

export const sameGamePlugin: GamePlugin<SameGameState, SameGameAction, typeof sameGameSettings> = {
  id: "same-game",
  title: "Same Game",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click connected groups of same-color blocks to remove them. Clear the entire board for a big bonus.",
  howToPlay: `The board is filled with colored blocks. Click any block that belongs to a group of two or more connected same-color blocks (connected horizontally or vertically). The entire group disappears and you score points equal to N × (N − 1), where N is the number of blocks removed.

After each removal, the remaining blocks fall downward under gravity to fill the empty space. Columns that become completely empty then slide to the right so all remaining blocks are packed together on the left side.

The goal is to clear as many blocks as possible. If you manage to remove every single block from the board, you earn a bonus of 1000 points. The game ends when no remaining group has two or more connected blocks of the same color.

Hovering over a block previews which group would be removed — highlighted blocks will be cleared on click. Groups of one isolated block cannot be clicked.

Strategy: large groups are worth disproportionately more because of the N×(N−1) scoring. A group of 10 scores 90 points while a group of 5 scores only 20. Plan removals to merge smaller groups of the same color before clicking. With 3 colors the board is easier to clear completely; 5 colors produces smaller, more isolated groups.`,
  settings: sameGameSettings,
  initialState: (seed: number, settings: SameGameSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".samegame-board")) ? { selector: ".samegame-board", pulses: 3 } : null,
  component: SameGame,
};

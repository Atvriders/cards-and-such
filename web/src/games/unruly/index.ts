import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnrulyState, UnrulyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Unruly } from "./Unruly.js";

export const unrulySettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["6", "8", "10"] as const,
    default: "6" as const,
  },
} as const;

type UnrulySettingsType = SettingsOf<typeof unrulySettings>;

export const unrulyPlugin: GamePlugin<UnrulyState, UnrulyAction, typeof unrulySettings> = {
  id: "unruly",
  title: "Unruly",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the grid with black and white tiles following three strict rules.",
  howToPlay: `Unruly (also called Binairo or Takuzu) is a binary logic puzzle. You are given a partially filled grid and must place black or white tiles in every empty cell while satisfying three rules:

1. Equal halves — every row and every column must contain exactly the same number of black tiles as white tiles (so a 6×6 grid needs 3 black and 3 white per row/column).
2. No triples — no three consecutive tiles in a row or column may have the same colour. This means you cannot have ■■■ or □□□ in a line.
3. Unique lines — no two rows may be identical, and no two columns may be identical.

Click any empty cell to place a black tile (■). Click again to change it to white (□). Click once more to clear it back to empty. Locked "given" cells cannot be changed. Cells that violate rule 1 or 2 are highlighted in red.

Score: max(100, 1000 − moves × 3). Use the given tiles as anchors — when a row already has two blacks in a row, the third adjacent cell must be white. Work through the forced placements first, then use logic across rows and columns to narrow down the rest.`,
  settings: unrulySettings,
  initialState: (seed: number, settings: UnrulySettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Unruly,
};

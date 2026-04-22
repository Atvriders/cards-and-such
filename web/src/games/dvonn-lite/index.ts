import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DvonnLiteState, DvonnLiteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DvonnLite } from "./DvonnLite.js";

export const dvonnLiteSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type DvonnLiteSettingsType = SettingsOf<typeof dvonnLiteSettings>;

export const dvonnLitePlugin: GamePlugin<DvonnLiteState, DvonnLiteAction, typeof dvonnLiteSettings> = {
  id: "dvonn-lite",
  title: "Dvonn Lite",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Simplified Dvonn: stack pieces on a 6×6 board, control the most stacks at end.",
  howToPlay: `Dvonn Lite is a simplified version of the award-winning abstract game Dvonn. The board is 6×6. Two red DVONN pieces are placed randomly at the start as anchors. You play as White.

The game has two phases. In the Placement phase, players alternate clicking empty cells to place their pieces (12 each). In the Movement phase, players alternate moving a stack they control.

A stack is controlled by the player whose piece is on top. A stack of height H moves exactly H squares in one of the four orthogonal directions (up, down, left, right) and must land on an existing stack — you cannot move to an empty cell.

Key rule: after every move, any stack not connected (orthogonally) to a DVONN piece is immediately removed from the board. This shrinks the board progressively.

The game ends when neither player can move. The player controlling more stacks wins. Stacks with more pieces are worth the same as stacks of height 1 — only stack count matters.

Strategy: keep your stacks near the DVONN pieces to avoid being removed, and try to isolate your opponent's stacks.`,
  settings: dvonnLiteSettings,
  initialState: (seed: number, settings: DvonnLiteSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DvonnLite,
};

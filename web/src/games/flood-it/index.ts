import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FloodItState, FloodItAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FloodIt = /* @__PURE__ */ lazy(() => import("./FloodIt.js").then((mod) => ({ default: mod.FloodIt as unknown as React.ComponentType<unknown> })));
export const floodItSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

type FloodItSettingsType = SettingsOf<typeof floodItSettings>;

export const floodItPlugin: GamePlugin<FloodItState, FloodItAction, typeof floodItSettings> = {
  id: "flood-it",
  title: "Flood It",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flood the entire board from the top-left corner by choosing colors. Win in the fewest moves possible.",
  howToPlay: `The board is a 14×14 grid of colored squares. Your territory starts in the top-left corner — at the beginning it is just that single square, but it grows with each move you make.

Each turn you press one of the color buttons below the board. Your territory instantly expands to absorb all adjacent squares that match the chosen color. Keep choosing colors to spread your territory across the board.

The goal is to make the entire board a single color before you run out of moves. The move counter shows how many turns remain.

Think ahead: don't just pick colors one at a time. Look for the color that expands your territory the most — especially along edges and corners that are hard to reach. Trapping yourself with a color you haven't absorbed yet can waste valuable moves.

When you flood the whole board you earn a score based on the moves remaining — the faster you finish, the higher the bonus. If you run out of moves without flooding the entire board the game ends with no score. Fewer colors make the puzzle easier; six colors is the ultimate challenge.`,
  settings: floodItSettings,
  initialState: (seed: number, settings: FloodItSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".floodit-board")) ? { selector: ".floodit-board", pulses: 3 } : null,
  component: FloodIt,
};

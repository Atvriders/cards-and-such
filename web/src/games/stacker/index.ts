import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StackerState, StackerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Stacker } from "./Stacker.js";

export const stackerSettings = {
  _placeholder: {
    kind: "boolean" as const,
    label: "Show height guide",
    default: true,
  },
} as const;

type StackerSettingsType = SettingsOf<typeof stackerSettings>;

export const stackerPlugin: GamePlugin<StackerState, StackerAction, typeof stackerSettings> = {
  id: "stacker",
  title: "Stacker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop blocks onto each other to build the tallest stack you can. Any overhang is cut off.",
  howToPlay: `A block slides back and forth across the top of the screen. Press Space or click the Drop button to stop it and add it to the stack below. The goal is to build the tallest stack possible.

When you drop a block, only the part that overlaps the block beneath it survives — any portion hanging over the edge is cut off permanently. Your block gets narrower with each imprecise drop. If you miss entirely and the blocks don't overlap at all, the game ends immediately.

The block speeds up as you stack higher, so precision becomes harder the taller you go. Perfect drops — where the block lands exactly aligned with the one below — preserve the full width. Score is the sum of the block widths across all rows landed.

Tips: Try to establish a rhythm by watching the block's travel speed and pressing Space at the same point in each pass. The block bounces back immediately when it hits a wall, so there are only two moments per cycle where it is over the stack. Choose one side — say, always dropping on the left-to-right pass — and develop a feel for that timing. As the block narrows, the margin for error shrinks, so slow down your reaction and wait for the perfect moment rather than rushing.`,
  settings: stackerSettings,
  initialState: (_seed: number, _settings: StackerSettingsType) => initialState(),
  reducer,
  isTerminal,
  component: Stacker,
};

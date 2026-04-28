import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatchworkBaseState, PatchworkBaseAction, PatchworkBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatchworkBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const patchworkBasePlugin: GamePlugin<PatchworkBaseState, PatchworkBaseAction, typeof settings> = {
  id: "patchwork-base",
  title: "Patchwork",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Polyomino quilt tile placement on a 6x6 grid.",
  howToPlay: `Patchwork is a two-player polyomino game. This solo adaptation simplifies it: you have 14 single-cell quilt patches to place on a 6x6 grid. Each patch shows one of four colors: red, blue, green, or yellow.

Click any empty cell to place the next patch from the queue.

Scoring (computed at end):
• Each patch scores +1 base point.
• +2 bonus per orthogonal neighbor that shares its color.
• +3 bonus per patch on the central 2x2 (the prized center of the quilt).
• Empty cells inside a fully-surrounded region: −2 each (holes are bad in a quilt).
• Bonus +10 if a single color forms a 3x1 or 1x3 line anywhere.

The quilt thrives on color clustering and dense packing. Group same colors. Avoid leaving 1-cell holes. Aim to hit the center early.

A good quilt scores 30-45 points. The maximum is around 60 with perfect color clustering, full center, and a line bonus. Try different orderings — the queue is random each game.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatchworkBaseSettings),
  reducer,
  isTerminal,
  component: PatchworkBaseGame,
};

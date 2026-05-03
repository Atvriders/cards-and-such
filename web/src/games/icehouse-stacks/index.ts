import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const icehouseStacksPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "icehouse-stacks",
  title: "Icehouse (Stacks)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid stacking real-time abstract.",
  howToPlay: "Icehouse is Andrew Looney's original real-time pyramid stacking abstract from 1987. In this turn-based 5x5 adaptation across 14 turns (7 each), you place pyramids on intersections; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Icehouse is real-time, simultaneous, and fluid — players place pyramids that either 'point at' or 'attack' opponent pieces, with no turn structure. The original 1987 game inspired the entire Looney Labs pyramid game line including Volcano and Homeworlds. Real Icehouse plays in 5-15 minutes with three to five players; this digital adaptation simplifies to two-player turn-based placement. Strategy: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie. Real Icehouse is a niche cult game; this version preserves the placement-and-counting core for quick digital play.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DameoFreelingState, DameoFreelingAction, DameoFreelingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DameoFreelingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DameoFreelingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dameoFreelingPlugin: GamePlugin<DameoFreelingState, DameoFreelingAction, typeof settings> = {
  id: "dameo-freeling",
  title: "Dameo (Freeling)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Christian Freeling's Dameo blends Draughts variants.",
  howToPlay: "Dameo is Christian Freeling's 2000 design that blends features of International, Russian, and Italian draughts on an 8x8 board, with men moving any number of squares forward like rooks and capturing diagonally. This 5x5 placement adaptation simplifies the unique movement to pure territory claiming. Across 15 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fifteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Freeling, the prolific Dutch designer of MindSports.nl, created Dameo to fix what he saw as positional weaknesses in standard checkers. Dameo features include linear man movement, mandatory longest captures, and king flight. Its board still hosts a small but enthusiastic online community. The 5x5 reduction preserves the territory feel; the full game rewards patient men formations.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DameoFreelingSettings),
  reducer, isTerminal, hint: (state: DameoFreelingState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: DameoFreelingGame,
};

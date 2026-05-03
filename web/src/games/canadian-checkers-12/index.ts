import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanadianCheckers12State, CanadianCheckers12Action, CanadianCheckers12Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CanadianCheckers12Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CanadianCheckers12Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const canadianCheckers12Plugin: GamePlugin<CanadianCheckers12State, CanadianCheckers12Action, typeof settings> = {
  id: "canadian-checkers-12",
  title: "Canadian Checkers 12x12",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12x12 International-style Draughts — placement abstraction.",
  howToPlay: "Canadian Checkers is the 12x12 International Draughts variant played in Quebec since the 19th century — the largest mainstream draughts board with 60 pieces per side. This adaptation reduces the board to a 6x6 placement grid because the full 12x12 capture chains require minutes per move. Across 18 turns you and a random CPU alternate placing pieces on empty squares. The CPU plays uniformly at random. Click an empty cell to place. The player with more pieces at the eighteen-move limit wins. Canadian Checkers' real game features long-distance king flying captures — multi-jump chains across most of the board are common. The 12x12 takes about 90 minutes for skilled players; 6x6 finishes in under a minute. Final scoreboard: 100 points for a win, 25 for a tie. The placement reduction preserves the territory-claiming intuition that drives serious draughts play. Canadian Checkers remains a regional pride in Eastern Canada.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CanadianCheckers12Settings),
  reducer, isTerminal, hint: (state: CanadianCheckers12State): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: CanadianCheckers12Game,
};

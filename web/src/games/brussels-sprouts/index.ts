import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const brusselsSproutsPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "brussels-sprouts",
  title: "Brussels Sprouts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crosses-instead-of-dots Sprouts variant.",
  howToPlay: "Brussels Sprouts is a topology variant of John Conway's Sprouts where crosses replace dots and edges connect cross-arms. In this 5x5 placement adaptation across 14 turns (7 each), you place 'crosses' on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Brussels Sprouts starts with several crosses and players draw curves that connect cross-tips. The last player able to draw a curve wins. The game is provably finite (always ends after a fixed number of moves regardless of strategy) and is a classic illustration of Euler-formula topology. Sprouts (regular dots) was invented by Conway and Michael Paterson in 1967 at Cambridge. Strategy: contest centre and edges in the placement version. Final scoreboard: 100 points for the win, 25 for a tie. The pure mathematical elegance of full Brussels Sprouts is preserved in academic graph-theory courses worldwide.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};

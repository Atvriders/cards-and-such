import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bohnenspielPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "bohnenspiel",
  title: "Bohnenspiel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German 6-pit Mancala.",
  howToPlay: "Bohnenspiel ('bean game') is the German 6-pit Mancala variant popular in southern Germany and Austria. In this 5x5 placement adaptation across 14 turns (7 each), you place bean-pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Bohnenspiel plays on a 14-pit board (six per side plus two stores) with six beans per pit. Sowing is counter-clockwise. Captures happen when the last bean lands in an opponent's pit making the count 2, 4, or 6 (even numbers only) — a distinctive variation from West African Mancala captures. Bohnenspiel was a parlour game in 18th-19th century Germany; surviving wooden boards are sold in southern German antique shops. The 'bean' theme reflects rural farming origins. Strategy in this placement version: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie. The even-count capture rule produces different game patterns from West African variants.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};

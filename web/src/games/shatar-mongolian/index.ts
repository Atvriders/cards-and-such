import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const shatarMongolianPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "shatar-mongolian",
  title: "Shatar (Mongolian)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mongolian chess variant.",
  howToPlay: "Shatar is the traditional Mongolian chess, descended from Persian Shatranj along the Silk Road. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Shatar has the King (Noyon, Lord), Queen-equivalent (Bers), Knights (Mori, Horse), Rooks (Tergen, Cart), Bishops (Teme, Camel), and Pawns (Hu, Boy). Mongolian etiquette forbids checkmating with bare king; the full set of pieces must be present. Pawns promote only to Bers when they reach the far rank. Some traditional Mongolian sets carve pieces as miniature herders, sheep, and horses. Shatar is preserved by enthusiasts in Ulaanbaatar; competitive play is rare today. Strategy: claim the centre. Final scoreboard: 100 points for the win, 25 for a tie. The Silk Road history is preserved by every traditional set.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};

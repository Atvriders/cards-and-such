import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tamskTimedPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "tamsk-timed",
  title: "Tamsk (Timed)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sandglass-driven Gipf-series abstract.",
  howToPlay: "Tamsk is the third Project Gipf abstract by Kris Burm, famous for its sandglass timer mechanism. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on a small board; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. The full Tamsk has each piece sit atop a tiny sandglass that flips on every move; players race to make moves before any glass empties. This simplified version skips the timer mechanic to focus on placement counting. Tamsk won several abstract-game awards in 1998 and is renowned for its physical drama — the table is filled with flowing sand. The sandglass mechanism is among the most distinctive in any abstract published. Strategy: aim for the centre quickly. Final scoreboard: 100 points for the win, 25 for a tie. The full Tamsk plays in real-time; this digital version provides turn-based access without the sand.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};

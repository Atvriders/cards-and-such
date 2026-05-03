import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const connectSixClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "connect-six-classic",
  title: "Connect Six (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six-in-a-row on a large grid; place two stones per turn after the opening.",
  howToPlay: "Connect Six is a connect-line game designed to balance the first-player advantage of Gomoku. After the opening move, each player places two stones per turn instead of one, and the goal is to align six in a row. The grid is large — typically 19×19, though this implementation uses a manageable 13×13 for clarity.\n\nIn this simplified single-player edition you play black against a random CPU playing white. Click any empty cell to place a stone (the two-per-turn balancing rule is reduced to one-per-turn here for accessibility). The first player to align six stones in a row, column, or diagonal wins.\n\nThe board is shown as a 13×13 grid of empty intersections. Your stones display red; the CPU's display blue. Filled cells cannot be played on.\n\nConnect Six tactics center on broad threat-building because six is hard to complete. Build open-five threats and double-fours where possible. The CPU plays random legal moves, so a careful plan around the central area reliably wins. Score is 100 plus a piece-count bonus for a win, 25 for a draw.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};

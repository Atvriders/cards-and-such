import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const morrisTwelveClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "morris-twelve-cl",
  title: "Twelve Men's Morris (Connect)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Largest Morris-family game; three-in-a-row on a wider grid with diagonal lines.",
  howToPlay: "Twelve Men's Morris is the largest of the Morris family, played on a square board with extra diagonal lines that allow more mill formations. The classic game uses placement and sliding phases. This Connect edition simplifies it to placement-only three-in-a-row on an 8×8 grid for a quick game.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first to align three stones in a row, column, or diagonal wins.\n\nThe board displays as an 8×8 grid of circular slots. Your stones show red; the CPU's stones show blue. Filled cells are not selectable.\n\nWith 64 cells and only three-in-a-row to win, this game is fast. Strong tactics: cluster your early stones near the center and along diagonals — diagonal-three wins are easiest to overlook for an unobservant opponent. The CPU plays random legal moves, so consistent threat-building reliably wins. A win scores 100 plus a per-piece bonus; a draw scores 25.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};

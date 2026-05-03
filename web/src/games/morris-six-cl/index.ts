import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const morrisSixClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "morris-six-cl",
  title: "Six Men's Morris (Connect)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Smaller Morris-family three-in-a-row on a six-point grid.",
  howToPlay: "Six Men's Morris is a smaller cousin of Nine Men's Morris played on a board with six pieces per side. The traditional game involves placement and movement phases with mill-formation captures. This Connect edition simplifies it to a placement-only three-in-a-row game on a 6×6 grid for a quick session.\n\nYou play first against a random CPU. Click any empty cell to place your stone. The CPU plays a random legal move. Whoever first aligns three stones in a row, column, or diagonal wins.\n\nThe board appears as a 6×6 grid of circular slots. Your stones display red; the CPU's stones display blue.\n\nThis simplified Six Men's Morris rewards center-area control: the centermost cells participate in the most three-in-a-row lines. Build double threats — two open-twos that each could complete to a three — to overwhelm the CPU's blocking. Because the CPU picks random legal moves, methodical center-play wins consistently. A win scores 100 plus a per-piece bonus; a draw scores 25.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};

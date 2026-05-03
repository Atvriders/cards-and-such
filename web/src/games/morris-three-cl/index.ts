import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const morrisThreeClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "morris-three-cl",
  title: "Three Men's Morris (Connect)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tiny 3×3 Morris cousin; three-in-a-row with diagonals to win.",
  howToPlay: "Three Men's Morris is the smallest member of the Morris family, played with three pieces per side on a 3×3 grid that includes diagonal lines. It is essentially a Tic-Tac-Toe variant played first by placing stones and then by sliding them to adjacent points. This Connect edition uses a placement-only rule on a 3×3 grid for a one-minute game.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first player to align three stones in a row, column, or diagonal wins.\n\nThe board displays as a 3×3 grid. Your stones show red; the CPU's stones show blue.\n\nLike Tic-Tac-Toe, optimal play in this simplified Three Men's Morris ends in a draw. Against a random CPU, however, you can routinely win by playing the center and watching for the CPU's missed blocks. A win scores 100 plus a per-piece bonus; a draw scores 25; a loss scores zero. Aim for quick three-piece wins.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};

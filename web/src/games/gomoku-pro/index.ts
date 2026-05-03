import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GomokuProState, GomokuProAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GomokuPro = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GomokuPro as unknown as React.ComponentType<unknown> })));
export const gomokuProSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type GomokuProSettingsType = SettingsOf<typeof gomokuProSettings>;

export const gomokuProPlugin: GamePlugin<GomokuProState, GomokuProAction, typeof gomokuProSettings> = {
  id: "gomoku-pro",
  title: "Gomoku Pro Rules",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gomoku with professional Renju-style restrictions for Black.",
  howToPlay: `Gomoku Pro Rules adds professional tournament constraints to standard Gomoku. The goal remains the same — be first to place five stones in a row horizontally, vertically, or diagonally on a 15×15 board. You play Black and move first; the bot plays White.

The key difference from free Gomoku is that Black's powerful first-mover advantage is balanced by three forbidden-move rules. Black may not create an overline (six or more in a row), a double-four (two simultaneous open-four threats in a single move), or a double-three (two simultaneous open-three threats in a single move). Attempting a forbidden move is simply ignored. White plays without any restrictions and wins with five or more in a row.

Click any empty intersection to place your stone. The bot responds with a heuristic that blocks your threats and builds its own. Plan carefully: the forbidden-move rules can turn a winning sequence into a loss if you accidentally trigger a double-three or double-four while building your attack.

Scoring: Black (you) wins = 30; White (bot) wins = 0.`,
  settings: gomokuProSettings,
  initialState: (seed: number, settings: GomokuProSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".gomokupro-svg")) ? { selector: ".gomokupro-svg", pulses: 3 } : null,
  component: GomokuPro,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const connectFourGravityFlipPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "connect-four-gravity-flip",
  title: "Connect Four (Gravity Flip)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gravity-flip Connect Four variant on 6x7.",
  howToPlay: "Connect Four (Gravity Flip) is the variant where mid-game gravity rules can flip; this minimal version sticks to standard drops with a four-in-a-row goal. In this minimal single-player edition you face a random CPU on a 6x7 grid. Pieces drop into the chosen column under gravity, settling at the lowest empty cell. You play first as red; the CPU answers in blue. The first side to align 4 of their pieces in a row, column, or diagonal wins the game outright. The CPU picks legal moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; a random CPU will usually only block one threat. Center play controls the most lines, so claim the middle early. Scoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw counts as 25 points; a loss is zero. One match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};

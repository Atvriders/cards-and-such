import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ticTacToe4x4ClPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "tic-tac-toe-4x4-cl",
  title: "Tic-Tac-Toe 4x4 (CL)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tic-Tac-Toe on 4x4 grid; four-in-a-row wins.",
  howToPlay: "Tic-Tac-Toe 4x4 plays on a larger grid with a four-in-a-row target; this is the connect-line edition with random-CPU opponent. In this minimal single-player edition you face a random CPU on a 4x4 grid. Click any empty cell to drop a piece there; pieces stay where placed. You play first as red; the CPU answers in blue. The first side to align 4 of their pieces in a row, column, or diagonal wins the game outright. The CPU picks legal moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; a random CPU will usually only block one threat. Center play controls the most lines, so claim the middle early. Scoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw counts as 25 points; a loss is zero. One match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ttt4cl-board")) ? { selector: ".ttt4cl-board", pulses: 3 } : null,
  component: ConnectGame,
};

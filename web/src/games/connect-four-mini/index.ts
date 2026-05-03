import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectFourMiniState, ConnectFourMiniAction, ConnectFourMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConnectFourMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConnectFourMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const connectFourMiniPlugin: GamePlugin<ConnectFourMiniState, ConnectFourMiniAction, typeof settings> = {
  id:"connect-four-mini", title:"Connect Four Mini", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"6x6 Connect Four against a CPU. Connect 4 in a row to win.",
  howToPlay:`Connect Four Mini is a compact 6×6 version of the classic. You play red against a yellow CPU. Click a column header to drop your piece — gravity pulls it to the lowest empty cell. The first player to align four pieces in a row, column, or diagonal wins.

A win earns 100 points plus a small bonus per piece placed. A draw (board full with no four-in-a-row) earns 25. A CPU loss scores zero. On the smaller board, real strategy is rewarded — center columns control more lines, and stacking around opponent threats blocks easy wins.

The CPU plays a basic strategy: it takes any immediate winning move, blocks your immediate winning move, and otherwise drops a random legal piece. Setting up a double threat (two ways to win on the next move) reliably beats it.

Connect Four Mini is one full match. Hit "New Game" any time to start over with a fresh board.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ConnectFourMiniSettings),
  reducer,isTerminal,hint: (state: ConnectFourMiniState): HintTarget | null => state.phase === "playing" ? { selector: '.c4mini-board-shell', pulses: 3 } : null, component:ConnectFourMiniGame,
};

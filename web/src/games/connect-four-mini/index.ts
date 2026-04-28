import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectFourMiniState, ConnectFourMiniAction, ConnectFourMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectFourMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const connectFourMiniPlugin: GamePlugin<ConnectFourMiniState, ConnectFourMiniAction, typeof settings> = {
  id:"connect-four-mini", title:"Connect Four Mini", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"5x5 Connect Four against a random CPU. Connect 4 in a row to win.",
  howToPlay:`Connect Four Mini is a compact 5×5 version of the classic. You play red against a random-CPU yellow. Click a column to drop your piece — gravity pulls it to the lowest empty cell. The first player to connect four pieces in a row, column, or diagonal wins.

A win earns 100 points. A draw (board full with no four-in-a-row) earns 25. A CPU win scores zero. The board is small enough that real strategic play is rewarded — center columns control more diagonals, and stacking around opponent threats blocks easy wins.

The CPU drops pieces in random valid columns, so it makes occasional good moves but no real plan. Outsmarting it should be doable; aim to set up double-threat positions where two diagonals or rows can complete next turn.

Connect Four Mini is one full match — once the board is decided, your final score is locked. Play sharp, claim the center, and chain those four!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ConnectFourMiniSettings),
  reducer,isTerminal,component:ConnectFourMiniGame,
};

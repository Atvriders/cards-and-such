import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArdRiState, ArdRiAction, ArdRiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ArdRiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ArdRiGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ardRiPlugin: GamePlugin<ArdRiState, ArdRiAction, typeof settings> = {
  id:"ard-ri", title:"Ard Rí", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Scottish 5x5 Tafl. Place vs random CPU; most pieces wins.",
  howToPlay:"Ard Rí (\"High King\") is a Scottish Tafl-family game played on a 5×5 board, historically an asymmetric king-defense race. This compact version reframes the gameplay as a placement contest: you and a random CPU take turns placing pieces on empty cells across 14 total moves (7 each).\n\nClick any empty cell to place your piece. The CPU then places a piece randomly. The game ends when 14 moves have been made or the board fills. Player with most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Tactically, since the CPU plays randomly it often leaves placement opportunities you can exploit; aim for the center and corners — traditional power positions in Tafl games.\n\nA simple, fast Celtic strategy game that captures the essence of Ard Rí without the asymmetric king-rules complexity. Quick games, satisfying when you outplay the random opponent.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ArdRiSettings),
  reducer,isTerminal,component:ArdRiGame,
};

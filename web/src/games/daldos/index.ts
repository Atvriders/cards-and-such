import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DaldosState, DaldosAction, DaldosSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DaldosGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DaldosGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const daldosPlugin: GamePlugin<DaldosState, DaldosAction, typeof settings> = {
  id:"daldos", title:"Daldøs", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Danish dice-race game. Place vs random CPU on 5x5; most pieces wins.",
  howToPlay:"Daldøs is a Danish dice-race game with origins traced to Viking Age Scandinavia, traditionally played with elongated four-sided dice. This compact 5×5 version reframes the gameplay as a placement contest.\n\nYou and a random CPU alternate placing pieces on empty cells. Click any empty cell to place. CPU plays a random empty cell afterwards. After 14 moves (7 each) or when the 25-cell board fills, the player with the most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Equal counts naturally lead to draws; CPU's random play sometimes leaves opportunities for you to outmaneuver. The corners and central positions historically hold more strategic value.\n\nDaldøs's connection to Norse-era games makes it one of Europe's oldest continuously-played boardgames. This adaptation captures the placement-and-claim spirit, perfect for quick rounds against an unpredictable foe.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DaldosSettings),
  reducer,isTerminal,component:DaldosGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TablanState, TablanAction, TablanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TablanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TablanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tablanPlugin: GamePlugin<TablanState, TablanAction, typeof settings> = {
  id:"tablan", title:"Tablan", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"South Indian race game on 4x4. Place vs random CPU; most pieces wins.",
  howToPlay:"Tablan is a South Indian race game traditionally played with cowry-shell dice and pieces racing around a track. This compact 4×4 version reframes the gameplay as a placement contest where you and a random CPU alternate claiming squares.\n\nClick any empty cell to place your piece. The CPU follows with a random empty placement. Up to 12 moves total (6 each), ending when 12 moves are made or the 16-cell board fills. Most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Since both players make equal placements when possible, the game tends to draw — but the CPU's random play often opens tactical opportunities. Center cells and corners are typically more valuable.\n\nTablan has been played in southern India for centuries. This adaptation preserves the spatial spirit through fast placement rounds rather than dice-driven race mechanics. Quick, satisfying, surprisingly strategic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TablanSettings),
  reducer,isTerminal,hint: (state: TablanState): HintTarget | null => state.phase === "playing" ? { selector: '.tb-board', pulses: 3 } : null, component:TablanGame,
};

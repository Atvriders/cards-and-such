import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDragonFightState, DiceDragonFightAction, DiceDragonFightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceDragonFightGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceDragonFightGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDragonFightPlugin: GamePlugin<DiceDragonFightState, DiceDragonFightAction, typeof settings> = {
  id:"dice-dragon-fight", title:"Dice Dragon Fight", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fight a dragon. Highest single die scores critical hits.",
  howToPlay:"Dice Dragon Fight is a 10-round dice-rolling game where score is the highest single die times five. 🐉 Each round, press Roll Dice and two dice tumble across the screen. Take the higher of the two faces and multiply by 5: that's your round score.\n\nThe minimum is 5 (both dice showing 1) and the max is 30 (at least one 6). Across 10 rounds the expected total is around 240. There's no strategy — it's pure luck — but rolling a six in either die guarantees a strong round.\n\nPress Next after each result to continue, or Finish on the final round. Watch your running score climb in the upper right. Great for quick mini-game breaks: the whole game is over in well under a minute. May your high faces always smile up at you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDragonFightSettings),
  reducer,
  isTerminal,
  hint: (state: DiceDragonFightState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "choose") return { selector: '[data-testid="hint-target-dice-dragon-fight-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-dragon-fight-next"]', pulses: 3 };
    return null;
  },
  component:DiceDragonFightGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceIslandHopState, DiceIslandHopAction, DiceIslandHopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceIslandHopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceIslandHopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceIslandHopPlugin: GamePlugin<DiceIslandHopState, DiceIslandHopAction, typeof settings> = {
  id:"dice-island-hop", title:"Dice Island Hop", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hop islands by rolling dice. Higher max die rewards more.",
  howToPlay:"Dice Island Hop is a 10-round dice-rolling game where score is the highest single die times five. 🏝️ Each round, press Roll Dice and two dice tumble across the screen. Take the higher of the two faces and multiply by 5: that's your round score.\n\nThe minimum is 5 (both dice showing 1) and the max is 30 (at least one 6). Across 10 rounds the expected total is around 240. There's no strategy — it's pure luck — but rolling a six in either die guarantees a strong round.\n\nPress Next after each result to continue, or Finish on the final round. Watch your running score climb in the upper right. Great for quick mini-game breaks: the whole game is over in well under a minute. May your high faces always smile up at you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceIslandHopSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-island-hop-roll"]', pulses: 3 }; },
  component:DiceIslandHopGame,
};

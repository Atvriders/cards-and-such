import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerStackerState, TowerStackerAction, TowerStackerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TowerStackerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TowerStackerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const towerStackerPlugin: GamePlugin<TowerStackerState, TowerStackerAction, typeof settings> = {
  id:"tower-stacker", title:"Tower Stacker", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Tower Stacker — endless block-stacking arcade games.",
  howToPlay:"Tower Stacker Trivia is a ten-question quiz about endless tower-stacking arcade games — those where the player taps to drop a moving block onto the previous block, with any overhang trimmed off, and the goal is to stack as tall as possible without ever missing. Stack (Ketchapp), Tower Bloxx, and many similar mobile titles popularized the genre. As blocks shrink with each miss, precision becomes harder. Each question tests history, mechanics, and famous titles in the tower-stacker genre. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TowerStackerSettings),
  reducer,isTerminal,hint: (state: TowerStackerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tower-stacker-primary"]', pulses: 3 } : null,component:TowerStackerGame,
};

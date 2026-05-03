import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WaterPistolState, WaterPistolAction, WaterPistolSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WaterPistol = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WaterPistol as unknown as React.ComponentType<unknown> })));
const settings = { duration: { kind:"enum" as const, label:"Time", options:["30","60"] as const, default:"30" as const } } as const;
type S = SettingsOf<typeof settings>;
export const waterPistolPlugin: GamePlugin<WaterPistolState, WaterPistolAction, typeof settings> = {
  id:"water-pistol", title:"Water Pistol", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Spray targets with your water pistol in the time limit! Each hit earns points.",
  howToPlay:`Water Pistol is a timed arcade clicking game. Eight circular targets are scattered around the play area. Click on them to "spray" them with water — each hit earns 50 points.

When you hit a target, it immediately respawns at a new random position. The game runs for 30 or 60 seconds (set in Settings). Your goal is to spray as many targets as possible before the timer runs out.

There is no penalty for missing — just keep clicking! The faster you identify and click targets, the more points you accumulate. With 30 seconds and excellent accuracy, hitting a target every second earns about 1500 points.

Targets are spread around the play area and replace themselves instantly, so you are always busy. The key is rapid scanning and clicking. Choose 60 seconds for a longer session with higher potential scores. Ready, aim, spray!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WaterPistolSettings),
  reducer, isTerminal, 
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".arcade-wrap svg", pulses: 3 }; },
  component:WaterPistol,
};

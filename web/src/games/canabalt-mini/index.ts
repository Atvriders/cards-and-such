import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanabaltMiniState, CanabaltMiniAction, CanabaltMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CanabaltMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CanabaltMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const canabaltMiniPlugin: GamePlugin<CanabaltMiniState, CanabaltMiniAction, typeof settings> = {
  id:"canabalt-mini", title:"Canabalt Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap rooftop runners as they leap across gaps.",
  howToPlay:"Canabalt Mini is a thirty-second rooftop-runner reflex game inspired by the classic one-button platformer Canabalt. Tiny runners appear across six rooftop lanes, leaping from building to building. Tap each runner before they vanish off the edge to score ten points. Spawn rates climb quickly — sometimes one or two new runners appear each tick, and each runner only stays visible for a handful of ticks before tumbling away. The board updates about once per second, and the clock counts down from thirty in the corner. Sharp eyes and faster fingers are key. Average runs net 220-300 points; rooftop-running pros regularly score 380+. Empty-space taps are free, so attack the screen aggressively. When the timer hits zero, the board freezes and your final score is locked in. Channel your inner sprinter and tap those leaping runners across the urban skyline. Ready, set, run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CanabaltMiniSettings),
  reducer,isTerminal,hint: (state: CanabaltMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-canabalt-mini-primary"]', pulses: 3 } : null,component:CanabaltMiniGame,
};

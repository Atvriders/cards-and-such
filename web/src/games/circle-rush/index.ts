import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CircleRushState, CircleRushAction, CircleRushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CircleRushGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CircleRushGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const circleRushPlugin: GamePlugin<CircleRushState, CircleRushAction, typeof settings> = {
  id:"circle-rush", title:"Circle Rush", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap circles appearing inside a target ring.",
  howToPlay:"Circle Rush is a thirty-second reflex sprint where circles appear inside a target ring across six radial slots — tap each circle before it disappears to score ten points. Missed circles age out and count against your accuracy. The ring ticks about once per second, spawning one or two fresh circles each tick. Each circle only lingers for a few ticks before fading. The timer counts down from thirty seconds in the upper-right corner. Average runs net 220-300 points; ring-watching reflex hunters routinely score 380+. Empty-space taps are free of penalty, so attack the screen aggressively when multiple circles appear at once. With a clean, geometric aesthetic and pure reflex gameplay, Circle Rush is perfect for warming up your hand-eye coordination. When the timer hits zero, the ring goes still and your final score is locked in. Watch the circles, time your taps, ride the rush — circle on, circle on!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CircleRushSettings),
  reducer,isTerminal,hint: (state: CircleRushState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-circle-rush-primary"]', pulses: 3 } : null,component:CircleRushGame,
};

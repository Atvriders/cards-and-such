import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HelicopterFlyerState, HelicopterFlyerAction, HelicopterFlyerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HelicopterFlyerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HelicopterFlyerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const helicopterFlyerPlugin: GamePlugin<HelicopterFlyerState, HelicopterFlyerAction, typeof settings> = {
  id:"helicopter-flyer", title:"Helicopter Flyer", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap helicopters drifting through corridor lanes.",
  howToPlay:"Helicopter Flyer is a thirty-second corridor-flying reflex game. Helicopters appear and drift across six corridor lanes — tap each one before it exits the screen to score ten points. The pace builds quickly: one or two fresh helicopters spawn each tick, and existing ones age out after a few ticks. The cockpit-cam timer counts down from thirty seconds in the upper-right. Helicopter Flyer is all about quick visual scanning and fast taps. Average runs net 220-300 points; chopper-spotting aces routinely clear 380+. Empty-space taps are free of penalty, so feel free to attack the screen aggressively when you spot multiple helicopters at once. When the timer hits zero, the corridor empties and your final score is locked in. The board ticks about once per second, giving you just enough time to react to each new chopper while the timer drains. Keep those rotors spinning!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HelicopterFlyerSettings),
  reducer,isTerminal,hint: (state: HelicopterFlyerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-helicopter-flyer-primary"]', pulses: 3 } : null,component:HelicopterFlyerGame,
};

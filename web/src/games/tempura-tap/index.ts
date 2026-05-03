import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TempuraTapState, TempuraTapAction, TempuraTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TempuraTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TempuraTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tempuraTapPlugin: GamePlugin<TempuraTapState, TempuraTapAction, typeof settings> = {
  id:"tempura-tap", title:"Tempura Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap fried tempura morsels as they're plated. 30-second clicker arcade.",
  howToPlay:"Tempura Tap is a 30-second clicker arcade themed on Japan's beloved light, crispy battered shrimp and vegetables. Golden tempura morsels appear across the plating board; tap each one before it slides off. Every tempura you grab scores 10 points.\n\nThe game ticks roughly once per second, spawning fresh tempura in random lanes. The board can fill with crispy targets quickly, so practice your tap speed and aim with precision — every piece you pluck is 10 points closer to a delicious top score.\n\nThere's no skill ceiling: the more tempura you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nGolden, crispy, hot — tap fast or lose your points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TempuraTapSettings),
  reducer,isTerminal,
  hint: (state: TempuraTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".tempura-target", pulses: 3 };
  },
  component:TempuraTapGame,
};

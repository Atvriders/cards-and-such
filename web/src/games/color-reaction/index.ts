import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorReactionState, ColorReactionAction, ColorReactionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorReactionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorReactionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const colorReactionPlugin: GamePlugin<ColorReactionState, ColorReactionAction, typeof settings> = {
  id:"color-reaction", title:"Color Reaction", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Reaction-time test: tap on green, not on red.",
  howToPlay:"Color Reaction is a thirty-tick reflex test in the classic 'go/no-go' tradition. Each round (about one second per tick), the central stage shows either GREEN (a 'go' signal) or RED (a 'no-go' signal). Your job: tap the stage when it's green, but absolutely do not tap when it's red. A correct green tap scores ten points; an incorrect red tap deducts five points (minimum zero). Misses (failing to tap a green) don't directly cost points, but you'll miss out on scoring opportunities. The timer counts down thirty ticks in the upper-right corner. This is a textbook neuropsychology task — used to measure inhibitory control and reaction time. Average runs land at 80-140 points; quick-reflex enthusiasts with disciplined inhibition routinely score 200+. When the thirty ticks expire, your final score is locked in. Train your inhibition, tap on green only, and rack up the points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColorReactionSettings),
  reducer,isTerminal,
  hint: (state: ColorReactionState) => {
    if (state.phase === "done") return null;
    return { selector: ".clrrct-target", pulses: 3 };
  },
  component:ColorReactionGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NailTapState, NailTapAction, NailTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NailTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NailTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nailTapPlugin: GamePlugin<NailTapState, NailTapAction, typeof settings> = {
  id:"nail-tap", title:"Nail Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap dropping nails to drive them home. 30-second clicker.",
  howToPlay:"Nail Tap is a 30-second carpentry-themed arcade clicker. Nails drop from the top of the screen in six lanes; tap each nail as fast as you can to hammer it home for 10 points. Miss them, and they fall into the basement junk heap unscored.\n\nThe board ticks roughly once per second, spawning fresh nails in random lanes. As you build up speed, the screen fills with shiny tools to whack — every tap earns points.\n\nThere's no skill ceiling: the more nails you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent.\n\nThe clock counts down in the top right; when it hits zero, your final score is locked in. Sound the carpenter's anvil and start hammering — and remember, a swift tap saves nine!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NailTapSettings),
  reducer,isTerminal,
  hint: (state: NailTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".ck-target", pulses: 3 };
  },
  component:NailTapGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StaplerSnapState, StaplerSnapAction, StaplerSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StaplerSnapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StaplerSnapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const staplerSnapPlugin: GamePlugin<StaplerSnapState, StaplerSnapAction, typeof settings> = {
  id:"stapler-snap", title:"Stapler Snap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click staplers in a desk-side frenzy. 30-second clicker.",
  howToPlay:"Stapler Snap is a 30-second office-supply clicker. Staplers spawn across 6 lanes; tap each one to snap it for 10 points. Each stapler hangs around for a few ticks before disappearing — miss too many and your final tally suffers.\n\nThe game ticks once per second, spawning fresh staplers in random lanes. The board can quickly fill with desk targets, so practice your hand-eye coordination and aim carefully.\n\nThere's no skill ceiling: the more staplers you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right.\n\nSnap to it and tap fast!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StaplerSnapSettings),
  reducer,isTerminal,
  hint: (state: StaplerSnapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:StaplerSnapGame,
};

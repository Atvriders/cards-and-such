import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StarSnapState, StarSnapAction, StarSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StarSnapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StarSnapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const starSnapPlugin: GamePlugin<StarSnapState, StarSnapAction, typeof settings> = {
  id:"star-snap", title:"Star Snap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click stars twinkling across the night sky. 30 seconds of cosmic clicking.",
  howToPlay:"Star Snap is a 30-second cosmic clicker arcade. Tiny twinkling stars appear across the night-sky board in six lanes; tap each star quickly to snap it for 10 points before it fades into the dark.\n\nEach star hangs around for a few ticks before drifting off into deep space. The board ticks roughly once per second, spawning fresh stars at random positions. The night sky can fill quickly with luminous targets, so practice your aim and reflexes — every star you snap is 10 points closer to the high score.\n\nAverage runs land near 200-300 points; sharpshooters pushing 500+ are showing real galactic talent. The clock counts down in the top right; when it hits zero, your final cosmic tally is locked in. There's no skill ceiling — the more stars you click in 30 seconds, the higher your final score climbs. Look up, snap fast, and rule the galaxy!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StarSnapSettings),
  reducer,isTerminal,
  hint: (state: StarSnapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:StarSnapGame,
};

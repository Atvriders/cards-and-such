import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LollipopLiftState, LollipopLiftAction, LollipopLiftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LollipopLiftGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LollipopLiftGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lollipopLiftPlugin: GamePlugin<LollipopLiftState, LollipopLiftAction, typeof settings> = {
  id:"lollipop-lift", title:"Lollipop Lift", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click lollipops drifting up the screen \u2014 30-second sweet clicker.",
  howToPlay:"Lollipop Lift is a simple 30-second clicker arcade. Lollipops drift across the playfield in six lanes; tap each lollipop as fast as you can to lift it for 10 points. Each lollipop hangs around for a few ticks before drifting away \u2014 miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh lollipops in random lanes. The board can quickly fill with sugary targets, so practice your hand-eye coordination \u2014 every tap is 10 sweet points closer to a top score.\n\nThere's no skill ceiling: the more lollipops you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and rack up those lollipop points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LollipopLiftSettings),
  reducer,isTerminal,
  hint: (state: LollipopLiftState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-lollipop-lift-target"]', pulses: 3 };
  },
  component:LollipopLiftGame,
};

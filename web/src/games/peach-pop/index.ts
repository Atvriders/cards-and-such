import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PeachPopState, PeachPopAction, PeachPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PeachPopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PeachPopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const peachPopPlugin: GamePlugin<PeachPopState, PeachPopAction, typeof settings> = {
  id:"peach-pop", title:"Peach Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop ripe peaches that drift across the screen. 30-second clicker.",
  howToPlay:`Peach Pop is a simple 30-second clicker arcade. Ripe peaches drift across the screen in six lanes; tap each peach as fast as you can to pop it for 10 points. Each peach hangs around for a few ticks before drifting off — miss too many and your final tally suffers.

The game ticks roughly once per second, spawning fresh peaches in random lanes. The board can quickly fill with juicy targets, so practice your hand-eye coordination and aim carefully — every peach you pop is 10 points closer to a top score.

There's no skill ceiling: the more peaches you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Mash that screen and rack up those peach points!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PeachPopSettings),
  reducer,isTerminal,
  hint: (state: PeachPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.peaches || state.peaches.length === 0) return null;
    return { selector: '[data-testid="hint-target-peach-pop-target"]', pulses: 3 };
  },
  component:PeachPopGame,
};

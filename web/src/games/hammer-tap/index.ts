import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HammerTapState, HammerTapAction, HammerTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HammerTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HammerTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hammerTapPlugin: GamePlugin<HammerTapState, HammerTapAction, typeof settings> = {
  id:"hammer-tap", title:"Hammer Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap swinging workshop hammers as fast as you can. 30-second clicker.",
  howToPlay:"Hammer Tap is a 30-second workshop-themed clicker. Hammers swing across the workshop in six lanes; tap each one as quickly as you can to score 10 points per hit. Each hammer hangs around for a few ticks before swinging out of reach — miss too many and your final tally suffers.\\n\\nThe board ticks roughly once per second, spawning fresh hammers in random lanes. The shop floor can quickly fill with swinging tools, so practice your reflexes and keep your tapping accurate. Every hammer you tap is 10 points closer to a top score.\\n\\nThere's no skill ceiling: the more hammers you tap in 30 seconds, the higher you score. Average runs land near 200-300 points; sharp craftsmen pushing 500+ are showing real workshop reflexes. The clock counts down in the top right; when it hits zero, your final score is locked in. Get hammering!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HammerTapSettings),
  reducer,isTerminal,
  hint: (state: HammerTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".fc-target", pulses: 3 };
  },
  component:HammerTapGame,
};

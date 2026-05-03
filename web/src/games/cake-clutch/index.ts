import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CakeClutchState, CakeClutchAction, CakeClutchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CakeClutchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CakeClutchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cakeClutchPlugin: GamePlugin<CakeClutchState, CakeClutchAction, typeof settings> = {
  id:"cake-clutch", title:"Cake Clutch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch passing cakes. 30s.",
  howToPlay:"Cake Clutch is a simple 30-second clicker arcade. 🍰 Targets drift through six lanes; tap each one as fast as you can to score 10 points per click. Each target hangs around for a few ticks before disappearing — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh targets in random lanes. The board can quickly fill, so practice your hand-eye coordination and aim carefully — every tap is 10 points closer to a top score.\n\nThere's no skill ceiling: the more targets you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and rack up those points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CakeClutchSettings),
  reducer,isTerminal,
  hint: (state: CakeClutchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.items || state.items.length === 0) return null;
    return { selector: '[data-testid="hint-target-cake-clutch-target"]', pulses: 3 };
  },
  component:CakeClutchGame,
};

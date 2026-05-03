import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaterpillarCatchState, CaterpillarCatchAction, CaterpillarCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CaterpillarCatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CaterpillarCatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const caterpillarCatchPlugin: GamePlugin<CaterpillarCatchState, CaterpillarCatchAction, typeof settings> = {
  id:"caterpillar-catch", title:"Caterpillar Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch crawling caterpillars in 30 seconds.",
  howToPlay:"Caterpillar Catch is a chill 30-second clicker arcade. Caterpillars crawl across the screen in six lanes; tap each one to catch it for 10 points. Each caterpillar hangs around for a few ticks before crawling off-screen — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh caterpillars in random lanes. Caterpillars move slower than the typical clicker target, so this is a more relaxed, reaction-friendly variant — perfect for younger or casual players.\n\nAverage runs land near 200-300 points; relaxed players hitting 400+ are doing great. The clock counts down in the top right; when it hits zero, your final score is locked in. A friendly, summer-garden-themed clicker for a quick reflex break. Catch all those crawlers!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaterpillarCatchSettings),
  reducer,isTerminal,
  hint: (state: CaterpillarCatchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-caterpillar-catch-target"]', pulses: 3 };
  },
  component:CaterpillarCatchGame,
};

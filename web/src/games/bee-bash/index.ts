import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BeeBashState, BeeBashAction, BeeBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BeeBashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BeeBashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const beeBashPlugin: GamePlugin<BeeBashState, BeeBashAction, typeof settings> = {
  id:"bee-bash", title:"Bee Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click bees in 30 seconds.",
  howToPlay:"Bee Bash is a simple 30-second clicker arcade. Bees buzz across the screen in six lanes; tap each bee as fast as you can to catch it for 10 points. Each bee hangs around for a few ticks before flying off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh bees in random lanes. The board can quickly fill with buzzing targets, so practice your hand-eye coordination and aim carefully — every bee you catch is 10 points closer to a top score.\n\nThere's no skill ceiling: the more bees you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in. Bzzz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BeeBashSettings),
  reducer,isTerminal,
  hint: (state: BeeBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.bugs || state.bugs.length === 0) return null;
    return { selector: '[data-testid="hint-target-bee-bash-target"]', pulses: 3 };
  },
  component:BeeBashGame,
};

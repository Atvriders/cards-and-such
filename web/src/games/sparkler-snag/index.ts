import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SparklerSnagState, SparklerSnagAction, SparklerSnagSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SparklerSnagGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SparklerSnagGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sparklerSnagPlugin: GamePlugin<SparklerSnagState, SparklerSnagAction, typeof settings> = {
  id:"sparkler-snag", title:"Sparkler Snag", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Snag sparklers fizzling across the screen. 25-second clicker.",
  howToPlay:"Sparkler Snag is a fast-paced 25-second clicker arcade. Glittering sparklers appear across a deep-purple twilight sky in six lanes; tap each one as fast as you can to snag it for 10 points before the spark fades. Each sparkler hangs in the air for just a few ticks \u2014 miss too many and your final tally suffers.\n\nThis is the shortest of the festive clickers (25 seconds vs. the usual 30), so the action is concentrated. The board ticks roughly once per second, spawning 1 or 2 fresh sparklers in random lanes. Hand-eye coordination is everything.\n\nAverage runs land near 180-260 points; truly quick fingers pushing 400+ are showing real reflex talent. The clock counts down in red at the top right; when it hits zero, your final score is locked in.\n\nWhether you're celebrating Independence Day, Diwali, New Year's, or just enjoying a backyard sparkler with kids, this clicker captures the magic of those brief, brilliant flashes!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SparklerSnagSettings),
  reducer,isTerminal,
  hint: (state: SparklerSnagState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-sparkler-snag-target"]', pulses: 3 };
  },
  component:SparklerSnagGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SquirrelSpotState, SquirrelSpotAction, SquirrelSpotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SquirrelSpotGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SquirrelSpotGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const squirrelSpotPlugin: GamePlugin<SquirrelSpotState, SquirrelSpotAction, typeof settings> = {
  id:"squirrel-spot", title:"Squirrel Spot", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click peeking squirrels darting through the trees. 30-second clicker.",
  howToPlay:"Squirrel Spot is a 30-second forest-themed clicker. Squirrels peek out from between the trees in six different lanes — tap each one before it disappears back into the brush for 10 points.\n\nThe game ticks once per second, spawning new squirrels at random lanes. Each one peeks out for a few ticks before retreating, so reaction time matters.\n\nThere's no strategy required beyond speed: the more squirrels you spot in 30 seconds, the higher your score. Average runs land 200-300; eagle-eyed players push past 500.\n\nTip: stay loose and scan the whole board — fixating on one corner means you'll miss squirrels in the others. Prioritize the longest-lingering squirrels because they're closest to retreating. The clock counts down in the top right; when zero, your final tally locks. Quick! Did you see that one? Tap fast! A great little reflex break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SquirrelSpotSettings),
  reducer,isTerminal,
  hint: (state: SquirrelSpotState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-squirrel-spot-target"]', pulses: 3 };
  },
  component:SquirrelSpotGame,
};

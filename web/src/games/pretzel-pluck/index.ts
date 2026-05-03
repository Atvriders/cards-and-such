import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PretzelPluckState, PretzelPluckAction, PretzelPluckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PretzelPluckGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PretzelPluckGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pretzelPluckPlugin: GamePlugin<PretzelPluckState, PretzelPluckAction, typeof settings> = {
  id:"pretzel-pluck", title:"Pretzel Pluck", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pluck pretzels from a moving conveyor as fast as you can. 30-second clicker.",
  howToPlay:`Pretzel Pluck challenges you to grab as many pretzels off a moving conveyor as you can in 30 seconds. Pretzels appear in six lanes; tap each one before it slides off the board to score 10 points apiece.

The board ticks roughly once per second, spawning fresh pretzels in random positions. Each pretzel sits on the board for a few ticks before vanishing, so you need quick eyes and quicker fingers. Misses don't subtract from your score, but every uncollected pretzel is 10 points you'll never get back.

There's no skill ceiling: the more pretzels you tap in 30 seconds, the higher your final score. Average runs land around 200-300 points; bakery-fast hands can clear 500+. The clock counts down in the top right; when it hits zero, your final tally is locked in.

Limber up those fingers — these salty knots aren't going to pluck themselves!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PretzelPluckSettings),
  reducer,isTerminal,
  hint: (state: PretzelPluckState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.pretzels || state.pretzels.length === 0) return null;
    return { selector: '[data-testid="hint-target-pretzel-pluck-target"]', pulses: 3 };
  },
  component:PretzelPluckGame,
};

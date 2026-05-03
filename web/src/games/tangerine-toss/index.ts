import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TangerineTossState, TangerineTossAction, TangerineTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TangerineTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TangerineTossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tangerineTossPlugin: GamePlugin<TangerineTossState, TangerineTossAction, typeof settings> = {
  id:"tangerine-toss", title:"Tangerine Toss", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Toss tangerines into a bin by clicking them. 30-second arcade clicker.",
  howToPlay:`Tangerine Toss is a 30-second clicker where you toss as many tangerines as you can into the basket in the corner. Tap each tangerine on the board and it flies (notionally) into the bin, scoring 10 points apiece.

The board has six lanes; tangerines appear in random positions and stick around for a few ticks before vanishing. Miss a tangerine and it rolls off the cart — no points awarded. The game ticks roughly once per second, spawning fresh fruit each time.

There's no skill ceiling: the more tangerines you toss in 30 seconds, the higher your final score. Average runs land around 250-300 points; sharp pickers can hit 500+ with consistent finger work. The clock counts down in the top right; when it hits zero, the produce stand closes and your final tally is locked in.

Aim for the bin and rack up that citrus score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TangerineTossSettings),
  reducer,isTerminal,
  hint: (state: TangerineTossState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.tangerines || state.tangerines.length === 0) return null;
    return { selector: '[data-testid="hint-target-tangerine-toss-target"]', pulses: 3 };
  },
  component:TangerineTossGame,
};

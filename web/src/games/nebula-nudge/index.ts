import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NebulaNudgeState, NebulaNudgeAction, NebulaNudgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NebulaNudgeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NebulaNudgeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nebulaNudgePlugin: GamePlugin<NebulaNudgeState, NebulaNudgeAction, typeof settings> = {
  id:"nebula-nudge", title:"Nebula Nudge", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap colorful nebula clouds drifting through space. 30-second arcade.",
  howToPlay:"Nebula Nudge is a 30-second arcade clicker set in deep space. Glowing nebula clouds drift across the board in six lanes; tap each cloud to nudge it (and score 10 points) before it dissolves back into the cosmic void.\n\nEach cloud lingers for a few ticks before dispersing. The board ticks roughly once per second, spawning new nebulae at random positions. The deep-space board can quickly fill with vibrant targets, so keep your fingers loose and your eyes wide.\n\nAverage runs land near 200-300 points; cosmic veterans can push 500+ with steady, fast taps. The countdown clock at the top right shows time remaining; when it hits zero, your final nebula tally is set. No misses are penalized — just keep nudging the clouds as fast as they appear. Drift, tap, repeat — and rule the nebulae!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NebulaNudgeSettings),
  reducer,isTerminal,
  hint: (state: NebulaNudgeState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-nebula-nudge-target"]', pulses: 3 };
  },
  component:NebulaNudgeGame,
};

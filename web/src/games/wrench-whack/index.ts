import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WrenchWhackState, WrenchWhackAction, WrenchWhackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WrenchWhackGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WrenchWhackGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wrenchWhackPlugin: GamePlugin<WrenchWhackState, WrenchWhackAction, typeof settings> = {
  id:"wrench-whack", title:"Wrench Whack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Whack flying workshop wrenches. 30-second clicker.",
  howToPlay:"Wrench Whack is a 30-second workshop-themed clicker. Wrenches are tossed across six workbench lanes; tap each one quickly to whack it for 10 points. Each wrench is in flight for only a few ticks before it sails out of reach — miss too many and your tally suffers.\\n\\nThe bench ticks roughly once per second, with fresh wrenches spawning in random lanes. The workshop fills with flying tools fast, so reflexes are key. There's no skill ceiling — the more wrenches you whack in 30 seconds, the higher your score.\\n\\nAverage runs land near 200-300 points; sharp shop hands pushing 500+ are showing top-tier hand-eye coordination. The clock counts down in the top right; when it hits zero, your final score is locked in. Whack hard, whack fast!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WrenchWhackSettings),
  reducer,isTerminal,
  hint: (state: WrenchWhackState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-wrench-whack-target"]', pulses: 3 };
  },
  component:WrenchWhackGame,
};

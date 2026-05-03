import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrackerCrunchState, CrackerCrunchAction, CrackerCrunchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrackerCrunchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrackerCrunchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crackerCrunchPlugin: GamePlugin<CrackerCrunchState, CrackerCrunchAction, typeof settings> = {
  id:"cracker-crunch", title:"Cracker Crunch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Crunch crackers before they crumble. 30-second clicker.",
  howToPlay:"Cracker Crunch is a crispy 30-second snack clicker. Square crackers appear in six lanes; tap each one as fast as you can to crunch it for 10 points. Each cracker lingers for a few ticks before crumbling away — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh crackers in random lanes. The board fills with toasty squares, so practice your hand-eye coordination — every crunch is 10 points closer to a top score.\n\nThere's no skill ceiling: the more crackers you tap in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and crunch all the crackers you can!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrackerCrunchSettings),
  reducer,isTerminal,
  hint: (state: CrackerCrunchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-cracker-crunch-target"]', pulses: 3 };
  },
  component:CrackerCrunchGame,
};

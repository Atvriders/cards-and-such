import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PalmFrondState, PalmFrondAction, PalmFrondSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PalmFrondGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PalmFrondGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const palmFrondPlugin: GamePlugin<PalmFrondState, PalmFrondAction, typeof settings> = {
  id:"palm-frond", title:"Palm Frond", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click swaying palm fronds. 30-second arcade.",
  howToPlay:"Palm Frond is a tropical 30-second clicker arcade. Palm fronds sway across the screen in six lanes; tap each one as fast as you can to score 10 points. Each frond hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh fronds in random lanes. The board can quickly fill with swaying targets, so practice your hand-eye coordination and aim carefully — every frond you click is 10 points closer to a top score.\n\nThere's no skill ceiling: the more fronds you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nChannel your inner beachcomber and rack up those palm-frond points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PalmFrondSettings),
  reducer,isTerminal,
  hint: (state: PalmFrondState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-palm-frond-target"]', pulses: 3 };
  },
  component:PalmFrondGame,
};

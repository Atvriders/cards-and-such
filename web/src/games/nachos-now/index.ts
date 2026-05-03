import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NachosNowState, NachosNowAction, NachosNowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NachosNowGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NachosNowGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nachosNowPlugin: GamePlugin<NachosNowState, NachosNowAction, typeof settings> = {
  id:"nachos-now", title:"Nachos Now", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap nachos before the salsa hits. 30-second clicker.",
  howToPlay:"Nachos Now is a cheesy 30-second snack clicker. Loaded nacho chips appear in six lanes; tap each one as fast as you can to scoop it for 10 points. Each nacho lingers for a few ticks before the salsa overtakes it — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh nachos in random lanes. The board fills with cheesy crunchy targets, so practice your hand-eye coordination — every scoop is 10 points closer to a top score.\n\nThere's no skill ceiling: the more nachos you tap in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and grab those nachos before the salsa hits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NachosNowSettings),
  reducer,isTerminal,
  hint: (state: NachosNowState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-nachos-now-target"]', pulses: 3 };
  },
  component:NachosNowGame,
};

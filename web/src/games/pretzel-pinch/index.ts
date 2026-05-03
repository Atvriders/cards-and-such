import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PretzelPinchState, PretzelPinchAction, PretzelPinchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PretzelPinchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PretzelPinchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pretzelPinchPlugin: GamePlugin<PretzelPinchState, PretzelPinchAction, typeof settings> = {
  id:"pretzel-pinch", title:"Pretzel Pinch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pinch pretzels before they go stale. 25-second clicker.",
  howToPlay:"Pretzel Pinch is a salty 25-second snack clicker. Twisty pretzels appear in six lanes; tap each one to pinch it for 10 points. Each pretzel lingers for a few ticks before going stale — miss too many and your tally suffers.\n\nThe game ticks roughly once per second, spawning fresh pretzels in random lanes. The board fills with golden-brown twists, so practice your hand-eye coordination — every pinch is 10 points closer to a top score.\n\nThe 25-second timer is the shortest in the snack arcade lineup, demanding faster reflexes for the same kind of run. Average runs land near 170-260 points; sharpshooters pushing 400+ are reflex-trained pretzel pros. The clock counts down in the top right; when it hits zero, your final score locks in.\n\nMash that screen and pinch those pretzels!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PretzelPinchSettings),
  reducer,isTerminal,
  hint: (state: PretzelPinchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-pretzel-pinch-target"]', pulses: 3 };
  },
  component:PretzelPinchGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConfettiCatchState, ConfettiCatchAction, ConfettiCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ConfettiCatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConfettiCatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const confettiCatchPlugin: GamePlugin<ConfettiCatchState, ConfettiCatchAction, typeof settings> = {
  id:"confetti-catch", title:"Confetti Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch falling confetti at the party. 30-second clicker.",
  howToPlay:"Confetti Catch is a vibrant 30-second clicker arcade. Bright confetti poppers appear across a pink-to-yellow party sky in six lanes; tap each one as fast as you can to catch it for 10 points. Each pop hangs around for a few ticks before drifting off \u2014 miss too many and your final tally suffers.\n\nThe board ticks roughly once per second, spawning 1 or 2 fresh confetti bursts in random lanes. With every successful catch the party gets brighter \u2014 practice your hand-eye coordination and aim carefully.\n\nAverage runs land near 200-300 points; party kings and queens pushing 500+ are showing real reflex talent. The clock counts down in red at the top right; when it hits zero, your final score is locked in.\n\nWhether it's a birthday, an anniversary, a graduation, or any Tuesday that feels like a celebration, this clicker brings the festive energy. Tap to catch every burst and live in the moment \u2014 the final score is just a number, but the party is forever!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ConfettiCatchSettings),
  reducer,isTerminal,
  hint: (state: ConfettiCatchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-confetti-catch-target"]', pulses: 3 };
  },
  component:ConfettiCatchGame,
};

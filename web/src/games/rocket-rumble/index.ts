import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RocketRumbleState, RocketRumbleAction, RocketRumbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RocketRumbleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RocketRumbleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rocketRumblePlugin: GamePlugin<RocketRumbleState, RocketRumbleAction, typeof settings> = {
  id:"rocket-rumble", title:"Rocket Rumble", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click rumbling rockets blasting up. 30-second clicker.",
  howToPlay:"Rocket Rumble is a 30-second sci-fi clicker arcade. Rockets ignite and rumble upward across six launch lanes; tap each booster before it disappears into space for 10 points apiece. Each rocket hangs around for a few ticks — let too many escape orbit and your final tally suffers.\n\nThe launchpad ticks every 750ms, spawning fresh rockets in random lanes. The board can quickly fill with rumbling missiles, so practice your hand-eye coordination and aim carefully — every rocket you tap is one more clean launch and 10 points closer to a top score.\n\nThere's no skill ceiling: the more rockets you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nLight 'em up and let it rumble!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RocketRumbleSettings),
  reducer,isTerminal,
  hint: (state: RocketRumbleState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-rocket-rumble-target"]', pulses: 3 };
  },
  component:RocketRumbleGame,
};

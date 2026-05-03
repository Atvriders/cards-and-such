import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MeteorBashState, MeteorBashAction, MeteorBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MeteorBashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MeteorBashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const meteorBashPlugin: GamePlugin<MeteorBashState, MeteorBashAction, typeof settings> = {
  id:"meteor-bash", title:"Meteor Bash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bash meteors hurtling toward the planet. 25-second arcade.",
  howToPlay:"Meteor Bash is a 25-second arcade clicker — slightly faster-paced than its 30-second cousins. Meteors hurtle across the galactic board in six lanes; tap each meteor to bash it for 10 points before it impacts.\n\nEach meteor stays visible for a few ticks before vanishing. The board ticks roughly once per second, spawning new meteors at random positions. With only 25 seconds on the clock, every tap counts — there's less time to recover from misses or hesitation.\n\nAverage runs land near 150-220 points; sharpshooters pushing 350+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final bash tally is locked. There's no skill ceiling — the more meteors you smash in 25 seconds, the higher you'll climb. Bash fast, bash often, and save the planet!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MeteorBashSettings),
  reducer,isTerminal,
  hint: (state: MeteorBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-meteor-bash-target"]', pulses: 3 };
  },
  component:MeteorBashGame,
};

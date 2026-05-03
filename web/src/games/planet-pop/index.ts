import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PlanetPopState, PlanetPopAction, PlanetPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PlanetPopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PlanetPopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const planetPopPlugin: GamePlugin<PlanetPopState, PlanetPopAction, typeof settings> = {
  id:"planet-pop", title:"Planet Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop planets orbiting in the galactic clicker. 30-second arcade.",
  howToPlay:"Planet Pop is a 30-second arcade where tiny planets orbit through the galactic board. Tap each planet to pop it for 10 points before it spins out of view.\n\nEach planet hangs in orbit for a few ticks before drifting off. The board ticks roughly once per second, spawning new planets in random lanes. The galactic background can fill quickly with circling worlds, so practice your taps and rack up points.\n\nMost players hit 200-300 points; cosmic clickers push 500+ with sharp reflexes. The countdown clock in the top right ticks down to zero, locking in your final tally. Misses cost nothing — just keep popping planets as they orbit by. Pop fast, pop often, and chart your course through the galaxy of points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PlanetPopSettings),
  reducer,isTerminal,
  hint: (state: PlanetPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-planet-pop-target"]', pulses: 3 };
  },
  component:PlanetPopGame,
};

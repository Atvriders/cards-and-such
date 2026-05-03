import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { GoldfishGrabState, GoldfishGrabAction, GoldfishGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GoldfishGrabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GoldfishGrabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const goldfishGrabPlugin: GamePlugin<GoldfishGrabState, GoldfishGrabAction, typeof settings> = {
  id:"goldfish-grab", title:"Goldfish Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab goldfish darting across the screen. 30-second clicker.",
  howToPlay:`Goldfish Grab is a 30-second arcade clicker. Goldfish appear in random lanes and drift across the board; tap each one before it disappears to score 10 points.

The game ticks once per beat (about every three-quarters of a second), spawning fresh goldfish in random lanes. Each goldfish lingers for a few ticks before vanishing — miss too many and your score suffers, since unattended goldfish count toward your missed tally.

There is no skill ceiling beyond reflexes and accuracy: the more goldfish you grab in 30 seconds, the higher your final score. Average runs land near 200–300 points; sharpshooters routinely push past 500. The clock counts down in the top right corner — when it hits zero, the game ends and your final tally is locked in.

Mash that screen and rack up the goldfish count!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GoldfishGrabSettings),
  reducer, isTerminal,
  hint: (state: GoldfishGrabState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-goldfish-grab-target"]', pulses: 3 };
  },
  component: GoldfishGrabGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PuppyTapState, PuppyTapAction, PuppyTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PuppyTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PuppyTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const puppyTapPlugin: GamePlugin<PuppyTapState, PuppyTapAction, typeof settings> = {
  id:"puppy-tap", title:"Puppy Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap puppies darting across the screen. 30-second clicker.",
  howToPlay:`Puppy Tap is a 30-second arcade clicker. Puppies appear in random lanes and drift across the board; tap each one before it disappears to score 10 points.

The game ticks once per beat (about every three-quarters of a second), spawning fresh puppies in random lanes. Each puppy lingers for a few ticks before vanishing — miss too many and your score suffers, since unattended puppies count toward your missed tally.

There is no skill ceiling beyond reflexes and accuracy: the more puppies you tap in 30 seconds, the higher your final score. Average runs land near 200–300 points; sharpshooters routinely push past 500. The clock counts down in the top right corner — when it hits zero, the game ends and your final tally is locked in.

Mash that screen and rack up the puppy count!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PuppyTapSettings),
  reducer, isTerminal, 
  hint: (state: PuppyTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".pt-target", pulses: 3 };
  },
  component: PuppyTapGame,
};

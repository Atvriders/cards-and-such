import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JellyfishJabState, JellyfishJabAction, JellyfishJabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JellyfishJabGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JellyfishJabGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jellyfishJabPlugin: GamePlugin<JellyfishJabState, JellyfishJabAction, typeof settings> = {
  id:"jellyfish-jab", title:"Jellyfish Jab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click pulsing jellyfish in the lagoon. 30s clicker.",
  howToPlay:`Jellyfish Jab is a 30-second pastel-blue clicker arcade. Translucent jellyfish drift across the screen in six lanes. Tap each jellyfish to jab it for 10 points before it floats off-screen.

The game ticks roughly once per second, spawning fresh jellyfish in random lanes. Each jellyfish hangs around for a few ticks before drifting away. The pastel-purple lagoon background can quickly fill with pulsing jellies — your job is to spot and tap them all.

Average runs hit 200-300 points; jellyfish jab masters can crack 500+. The clock counts down in the top right; when it hits zero, your final score is locked in.

Quick reflexes, gentle taps, and a calm hand — Jellyfish Jab is the perfect light arcade for a lazy afternoon. Sting that screen and harvest those jelly points!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JellyfishJabSettings),
  reducer,isTerminal,
  hint: (state: JellyfishJabState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-jellyfish-jab-target"]', pulses: 3 };
  },
  component:JellyfishJabGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LobsterLeapState, LobsterLeapAction, LobsterLeapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LobsterLeapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LobsterLeapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lobsterLeapPlugin: GamePlugin<LobsterLeapState, LobsterLeapAction, typeof settings> = {
  id:"lobster-leap", title:"Lobster Leap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click leaping lobsters for 25 seconds.",
  howToPlay:"Lobster Leap is a 25-second clicker arcade with an underwater theme. Lobsters drift up onto the screen across six lanes; tap each one as fast as you can to catch it. Every tap scores 10 points.\n\nEach critter hangs around for a few ticks before drifting off — miss too many and your tally suffers. The board ticks roughly once per second, spawning fresh targets in random lanes. The board can fill up quickly, so practice your hand-eye coordination and aim carefully.\n\nThere's no skill ceiling: the more clicks you land in 25 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nThe game tracks both Caught and Missed totals so you can see your accuracy. Aim for fast and accurate hands. There's no penalty for a wild click that hits empty water — only for letting critters slip away. Splash through the deep!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LobsterLeapSettings),
  reducer,isTerminal,
  hint: (state: LobsterLeapState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.critters || state.critters.length === 0) return null;
    return { selector: '[data-testid="hint-target-lobster-leap-target"]', pulses: 3 };
  },
  component:LobsterLeapGame,
};

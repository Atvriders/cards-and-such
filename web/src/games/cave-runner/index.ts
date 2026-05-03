import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaveRunnerState, CaveRunnerAction, CaveRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CaveRunnerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CaveRunnerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const caveRunnerPlugin: GamePlugin<CaveRunnerState, CaveRunnerAction, typeof settings> = {
  id:"cave-runner", title:"Cave Runner", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap fluttering bats to navigate a narrow flapping cave.",
  howToPlay:"Cave Runner is a thirty-second cave-navigating reflex sprint inspired by the famous flappy-cave genre. Bats flutter into view across six cave lanes — your job is to tap them before they exit the cavern. Each tapped bat is worth ten points; missed bats count against your final accuracy. The cave ticks roughly once per second, with one or two fresh bats spawning each tick and existing ones aging out after a few ticks. The clock counts down from thirty seconds in the corner. With a moody dark cave aesthetic, this game tests both your hand-eye coordination and your visual scanning. Average runs net 200-280 points; bat-spotting veterans top 350. Empty-space taps are free, so aggressive screen attacks are encouraged. When the timer hits zero, the cave goes dark and your final score is locked in. Flap, tap, repeat — and survive the cave run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CaveRunnerSettings),
  reducer,isTerminal,hint: (state: CaveRunnerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cave-runner-primary"]', pulses: 3 } : null,component:CaveRunnerGame,
};

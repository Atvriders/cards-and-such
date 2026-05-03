import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiRollTossState, SushiRollTossAction, SushiRollTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SushiRollTossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SushiRollTossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sushiRollTossPlugin: GamePlugin<SushiRollTossState, SushiRollTossAction, typeof settings> = {
  id: "sushi-roll-toss", title: "Sushi Roll Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Spin and toss sushi rolls to hit the target plate with perfect speed!",
  howToPlay: `Sushi Roll Toss is a precision spinning game. Each round, set the spin speed slider and launch the roll. The target plate needs the roll at just the right velocity to land perfectly.\n\nToo slow and the roll stops short; too fast and it skids past. Adjust the spin slider to match the ideal speed for each round.\n\nYour score per round depends on how close your spin is to the secret target. After 10 rounds, total up your score and see if you mastered the sushi conveyor!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as SushiRollTossSettings),
  reducer, isTerminal,
    hint: (state: SushiRollTossState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-sushi-roll-toss-action"]', pulses: 3 };
    },
  component: SushiRollTossGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClimbTheLadderState, ClimbTheLadderAction, ClimbTheLadderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ClimbTheLadderDice = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ClimbTheLadderDice as unknown as React.ComponentType<unknown> })));
const settings = {
  rerolls: { kind: "enum" as const, label: "Re-rolls per Rung", options: ["0", "1", "2"] as const, default: "1" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const climbTheLadderDicePlugin: GamePlugin<ClimbTheLadderState, ClimbTheLadderAction, typeof settings> = {
  id: "climb-the-ladder-dice",
  title: "Climb the Ladder Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six rungs with rising targets. Roll 2d6 each rung and try to meet or beat the target sum to score!",
  howToPlay: `Climb the Ladder is a dice game with six rungs. Each rung has a minimum target sum you must roll on two dice to score points. Rung 1 requires at least 4, rung 2 at least 5, increasing to rung 6 which requires at least 9.

At each rung you roll two dice. You can optionally hold one or both dice and re-roll the other(s) — the number of re-rolls per rung is set in Settings (0, 1, or 2). Click a die to toggle its hold state before re-rolling.

If your final dice sum meets or beats the rung target, you score the sum as points. If not, you score zero for that rung. Either way the game moves to the next rung.

After all six rungs, your total is your final score. A perfect game where every rung is passed can score up to about 54 points.

Adjust re-rolls in Settings for an easier or harder challenge. No re-rolls is the purest test of luck!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClimbTheLadderSettings),
  reducer, isTerminal,
  hint: (state: ClimbTheLadderState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-climb-the-ladder-dice-accept"]', pulses: 3 };
  },
  component: ClimbTheLadderDice,
};

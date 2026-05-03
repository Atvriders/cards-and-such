import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpinRollState, DiceSpinRollAction, DiceSpinRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceSpinRollGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceSpinRollGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpinRollPlugin: GamePlugin<DiceSpinRollState, DiceSpinRollAction, typeof settings> = {
  id: "dice-spin-roll", title: "Dice Spin Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll 3 dice and score based on how close the total is to a changing target number.",
  howToPlay: `Dice Spin Roll shows you a target number each round. Roll three dice and score based on how close the sum is to that target — a perfect match scores 50 points.

Every 10 points the sum is off from the target reduces your score by 10. A 1-off earns 40 points, a 5-off earns 0. The target changes each round.

Over 10 or 20 rounds, luck and variance determine how often you hit close to the target. Good runs build big scores quickly. Can you stay consistently close?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceSpinRollSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSpinRollState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "waiting") return { selector: '[data-testid="hint-target-dice-spin-roll-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-spin-roll-next"]', pulses: 3 };
    return null;
  },
  component: DiceSpinRollGame,
};

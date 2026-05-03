import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SumTargetState, SumTargetAction, SumTargetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SumTargetDice } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "12"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const sumTargetDicePlugin: GamePlugin<SumTargetState, SumTargetAction, typeof settings> = {
  id: "sum-target-dice",
  title: "Sum Target Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice and try to hit a target sum exactly! Partial scores for close rolls, 50 pts for bulls-eye.",
  howToPlay: `Sum Target Dice is a precision dice game. Each round a target number (from 5 to 16) is shown. You roll three dice and try to make the sum of all three dice match the target exactly.

A perfect match (sum equals target) scores 50 points. Being off by one scores 25 points. Off by two scores 20 points, off by three scores 15 points — each extra point of difference reduces the score by 5, down to zero.

You get two re-rolls per round (three total dice rolls). Click a die to hold it before re-rolling so it stays on its current face. Plan strategically — hold dice that are already contributing well toward the target.

Use Settings to play 5, 8, or 12 rounds. A perfect game can score up to 600 points with 12 rounds of bulls-eyes.

Think about probability: if your current sum is two below target and you have one re-roll left, which die should you re-roll to maximize your odds?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SumTargetSettings),
  reducer, isTerminal,
  hint: (state: SumTargetState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-sum-target-dice-next"]', pulses: 3 };
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-sum-target-dice-score"]', pulses: 3 };
    return null;
  },
  component: SumTargetDice,
};

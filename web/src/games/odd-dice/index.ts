import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type OddDiceState, type OddDiceAction } from "./state.js";
import { OddDice } from "./OddDice.js";

export const oddDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

export const oddDicePlugin: GamePlugin<OddDiceState, OddDiceAction, typeof oddDiceSettings> = {
  id: "odd-dice",
  title: "Odd Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice up to 3 times per round. Score only the odd-face dice. Maximize your total across all rounds!",
  howToPlay: `Odd Dice is a multi-round dice scoring game. Each round you roll five six-sided dice, and only the odd-valued dice count toward your score — 1, 3, and 5 contribute their face value; 2, 4, and 6 score nothing.

Each round gives you up to 3 rolls. After each roll you can see the current odd-sum and decide whether to keep rolling in hopes of better dice, or lock in your score with Keep Score. Re-rolling replaces all five dice simultaneously — you cannot hold individual dice.

After all rounds are complete, your total score is the sum of the odd-dice values you locked in across all rounds. The maximum possible score per round (all five dice showing 5) is 25, so the theoretical max across 3 rounds is 75.

Tactics: if your first roll shows a high odd sum (say 15+), consider banking it early rather than risking lower values on a re-roll. If you rolled mostly even dice, definitely re-roll. Your third roll is the last chance, so take it whenever possible.

Odd numbers on a d6 are: 1, 3, 5. Even: 2, 4, 6. Statistically half the dice will be odd on any given roll, with an expected odd sum of about 9 per roll.

Settings: choose 3-round or 5-round mode. The 5-round mode gives a higher total score potential and longer play time.`,
  settings: oddDiceSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state) => {
    return { selector: '[data-testid="hint-target-odd-dice-roll"]', pulses: 3 };
  },
  component: OddDice,
};

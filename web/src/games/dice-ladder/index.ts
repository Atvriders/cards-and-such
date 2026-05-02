import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceLadderState, DiceLadderAction, DiceLadderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceLadder } from "./Game.js";

const settings = {
  rungs: {
    kind: "enum" as const,
    label: "Ladder Rungs",
    options: ["10", "15", "20"] as const,
    default: "15" as const,
  },
  dice: {
    kind: "enum" as const,
    label: "Dice Count",
    options: ["1", "2"] as const,
    default: "1" as const,
  },
} as const;

export const diceLadderPlugin: GamePlugin<DiceLadderState, DiceLadderAction, typeof settings> = {
  id: "dice-ladder",
  title: "Dice Ladder",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Climb a ladder by rolling dice. Reach the top rung in as few turns as possible.",
  howToPlay: `Dice Ladder is a push-your-luck climbing game. You start at the bottom of a ladder with a set number of rungs (10, 15, or 20). Your goal is to reach the top rung in as few turns as possible.

Each turn has two steps. First, click Roll Dice to throw one or two dice (configurable). The dice reveal their values and the total sum is shown.

Second, decide how to use your roll. Click Climb Up to advance upward by the full dice sum — getting you closer to the top quickly. Or, if you're feeling strategic, click Slide Down to voluntarily slip back by the minimum single die value, which can be useful for repositioning (though only rarely wise).

When you land exactly on or past the top rung, you win! The score is 1000 minus 20 points for each turn taken, with a minimum score of 100. The fewer turns you use, the higher your score.

Tips: With one die, rolls average 3.5, so a 15-rung ladder takes roughly 4–5 turns on average. With two dice, you cover ground faster (average 7 per roll) but overshoot more often. Since you can go past the top and still win, there's rarely a reason to slide down — save that for creative playthroughs. Focus on always climbing up for the fastest possible finish.`,
  settings,
  initialState: (seed: number, s: DiceLadderSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).won) return null;
    if ((state as any).gameOver) return null;
    return { selector: '[data-testid="hint-target-dice-ladder-roll"]', pulses: 3 };
  },
  component: DiceLadder,
};

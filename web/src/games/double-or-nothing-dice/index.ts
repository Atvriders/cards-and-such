import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleOrNothingState, DoubleOrNothingAction, DoubleOrNothingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleOrNothingDice } from "./Game.js";

const settings = {
  startScore: { kind: "enum" as const, label: "Starting Score", options: ["10", "20", "50"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const doubleOrNothingDicePlugin: GamePlugin<DoubleOrNothingState, DoubleOrNothingAction, typeof settings> = {
  id: "double-or-nothing-dice",
  title: "Double or Nothing Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 2d6. Doubles double your score! Non-doubles cost 3 points. Bank anytime before you bust.",
  howToPlay: `Double or Nothing is a press-your-luck dice game. You start with a score (10, 20, or 50 depending on settings). Each turn you roll two dice.

If both dice show the same value (doubles), your current score is doubled — amazing! If the dice show different values, you lose 3 points. If your score drops to zero, you bust and score nothing.

At any point after your first roll, you can choose to Bank your current score and end the game safely. The tension is the decision: roll again for a chance to double, or bank before a string of bad rolls wipes you out.

Strategy matters — the chance of rolling doubles is 1 in 6 (about 17%). After a lucky double, banking is often wise. After several non-doubles, your score may be low enough that another roll is not worth the risk.

Final banked score is your result. Can you ride your luck to a massive total?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DoubleOrNothingSettings),
  reducer, isTerminal,
  hint: (state: DoubleOrNothingState): HintTarget | null => {
    if (isTerminal(state)) return null;
    // Roll/Bank pattern: nudge Bank when sitting on a doubled score; else Roll
    const score = (state as any).score ?? 0;
    if ((state as any).round > 0 && (state as any).lastDoubles && score >= 20) {
      return { selector: '[data-testid="hint-target-double-or-nothing-dice-bank"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-double-or-nothing-dice-roll"]', pulses: 3 };
  },
  component: DoubleOrNothingDice,
};

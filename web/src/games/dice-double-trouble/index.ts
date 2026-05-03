import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDoubleTroubleState, DiceDoubleTroubleAction, DiceDoubleTroubleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDoubleTrouble } from "./Game.js";

const diceDoubleTroubleSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["6", "8", "10"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof diceDoubleTroubleSettings>;

export const diceDoubleTroublePlugin: GamePlugin<DiceDoubleTroubleState, DiceDoubleTroubleAction, typeof diceDoubleTroubleSettings> = {
  id: "dice-double-trouble",
  title: "Dice Double Trouble",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice and score their sum. But roll doubles and you get a free extra roll! Roll doubles twice in a row for a whopping 50-point bonus!",
  howToPlay: `Dice Double Trouble is a roll-and-score game with exciting chain bonuses. Each round, roll two six-sided dice and score their sum as your round points — simple enough.

But if your two dice show matching faces (doubles), luck is on your side! You get an immediate free extra roll. The new roll's sum is added on top, boosting your round total. Roll doubles on your extra roll and you trigger the DOUBLE DOUBLE bonus — an extra 50 points added to your score!

Regular roll: score = sum of 2 dice.
Single double: score = first sum + reroll sum.
Double double: score = first sum + reroll sum + 50 bonus.

Press Roll to roll. The result is shown with highlights for doubles. Press Next to proceed to the following round.

Use Settings to choose 6, 8, or 10 rounds. Total score accumulates across all rounds. Can you chain two doubles in a row for the ultimate bonus?`,
  settings: diceDoubleTroubleSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceDoubleTroubleSettings),
  reducer, isTerminal, 
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "result") return { selector: '[data-testid="hint-target-dice-double-trouble-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-double-trouble-roll"]', pulses: 3 };
  },
  component: DiceDoubleTrouble,
};

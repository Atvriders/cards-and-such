import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStreak9State, DiceStreak9Action, DiceStreak9Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStreak9 } from "./Game.js";

const diceStreak9Settings = {
  target: { kind: "enum" as const, label: "Target Streak", options: ["5", "9"] as const, default: "5" as const },
} as const;

type DiceStreak9SettingsType = SettingsOf<typeof diceStreak9Settings>;

export const diceStreak9Plugin: GamePlugin<DiceStreak9State, DiceStreak9Action, typeof diceStreak9Settings> = {
  id: "dice-streak-9",
  title: "Dice Streak 9",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice and try to roll 1, 2, 3, 4, 5, 6 in order. Hit the streak target before you run out of attempts!",
  howToPlay: `Dice Streak 9 is a sequential dice game. You need to roll the numbers 1 through 6 in order using two dice per roll. If either die shows the next number you need, your streak continues. If neither die matches, the streak resets to 1.

On each turn, press Roll. Two dice appear on screen. If either matches the number you need next (shown as "Need"), your streak grows and you score points equal to 10 times your current streak length.

Missing a roll resets your streak — you must start again from 1. After a miss, the game displays "Miss — streak reset."

You have 20 attempts per game. The game ends when your best streak reaches the target (5 or 9) or you use all attempts.

Points grow fast on long streaks: hitting 5 in a row scores 10+20+30+40+50 = 150 for that streak alone. Use Settings to choose a target streak of 5 or 9. Can you complete a full 1-through-6 sequence?`,
  settings: diceStreak9Settings,
  initialState: (seed: number, settings: DiceStreak9SettingsType) => initialState(seed, settings as DiceStreak9Settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-streak-9-roll"]', pulses: 3 };
  },
  component: DiceStreak9,
};

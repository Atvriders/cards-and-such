import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoinCounterState, CoinCounterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoinCounter } from "./CoinCounter.js";

export const coinCounterSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time",
    options: ["60", "120"] as const,
    default: "60" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type CoinCounterSettingsType = SettingsOf<typeof coinCounterSettings>;

export const coinCounterPlugin: GamePlugin<CoinCounterState, CoinCounterAction, typeof coinCounterSettings> = {
  id: "coin-counter",
  title: "Coin Counter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Count the coins! Type the total value in cents before time runs out.",
  howToPlay: `Coin Counter is a fast-paced arithmetic practice game. Each round displays a collection of US coins — pennies (1¢), nickels (5¢), dimes (10¢), and quarters (25¢) — and you must calculate the total value.

For each puzzle, count up all the coins on screen and type the total number of cents in the input box, then click "Check" or press Enter to submit your answer. If you're correct, you score 10 points and your streak increases. If you're wrong, you lose 3 points and your streak resets.

A new puzzle appears immediately after each answer, so work quickly! The timer counts down from 60 or 120 seconds depending on your setting. When time runs out, your final score is displayed.

Difficulty controls the number of coin types and how many of each appear. Easy uses up to 2 coin types with at most 3 of each. Medium adds a third type with up to 5 per type. Hard can use all four coin types with up to 8 of each — the math gets tricky fast!

Tips: work left to right, starting with the highest-value coins (quarters first, then dimes, nickels, pennies). Count groups, not individual coins — seeing "3 quarters" means 75¢ without counting each one. A streak bonus keeps you motivated to stay accurate under pressure.`,
  settings: coinCounterSettings,
  initialState: (seed: number, settings: CoinCounterSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-coin-counter-action"]', pulses: 3 }; },
  component: CoinCounter,
};

import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumberOrderState, NumberOrderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberOrder } from "./Game.js";

export const numberOrderSettings = {
  count: {
    kind: "enum" as const,
    label: "Numbers",
    options: ["5", "8", "10"] as const,
    default: "5" as const,
  },
} as const;

type NumberOrderSettings = SettingsOf<typeof numberOrderSettings>;

export const numberOrderPlugin: GamePlugin<NumberOrderState, NumberOrderAction, typeof numberOrderSettings> = {
  id: "number-order",
  title: "Number Order",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap numbers in ascending order — a fun counting and ordering game for kids!",
  howToPlay: `Number Order is a fast-thinking game for young learners. A set of numbers appears jumbled up on the screen. Your goal is to tap them in order from smallest to biggest!

Start by finding the smallest number in the group and tapping it. Then find the next smallest, and so on, until all numbers are tapped in the correct order. Tapped numbers turn green to show they have been placed correctly.

If you tap a number out of order, you get a mistake and the game reminds you which number to tap next. Each mistake costs points, so try to think before you tap!

Your final score depends on how many mistakes you made. Zero mistakes earns a perfect score of 100. Each mistake reduces your score, so aim for a clean run!

Play with 5 numbers for a gentle start, 8 numbers for a medium challenge, or 10 numbers for the full brain workout. Numbers are chosen randomly from 1 to 30, so every game is different. Good luck!`,
  settings: numberOrderSettings,
  initialState: (seed: number, settings: NumberOrderSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: NumberOrder,
};

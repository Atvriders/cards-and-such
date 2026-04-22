import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OddOneOutState, OddOneOutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OddOneOut } from "./OddOneOut.js";

export const oddOneOutSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "35"] as const,
    default: "10" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type OddOneOutSettingsType = SettingsOf<typeof oddOneOutSettings>;

export const oddOneOutPlugin: GamePlugin<OddOneOutState, OddOneOutAction, typeof oddOneOutSettings> = {
  id: "odd-one-out",
  title: "Odd One Out",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the item that doesn't belong! 35 puzzles across science, music, geography, and more.",
  howToPlay: `Odd One Out presents four items — words, names, or numbers — and challenges you to identify which single item doesn't fit the same pattern as the other three.

Each puzzle has one clear odd item based on a hidden category or rule. For example: "Apple, Banana, Carrot, Grape" — Carrot is the odd one out because it's a vegetable while the rest are fruits. Some patterns are based on category membership, others on attributes like "can fly" or "is prime," and others on linguistic or scientific properties.

Click the item you believe is the odd one out. Once you pick, the correct answer is revealed in green and any wrong pick is shown in red. A short explanation appears to tell you the reasoning. Click "Next Puzzle" to continue.

Difficulty tiers: Easy uses common knowledge puzzles (fruits vs vegetables, colors vs shapes, planets vs moons). Medium adds science, geography, and music puzzles. Hard includes tricky logical, mathematical, and specialized knowledge challenges — like identifying which number is not prime or which city is not a national capital.

Scoring: 5 points per correct answer, no penalty for wrong ones. A 10-round session scores up to 50 points; a full 35-round marathon up to 175 points.`,
  settings: oddOneOutSettings,
  initialState: (seed: number, settings: OddOneOutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: OddOneOut,
};

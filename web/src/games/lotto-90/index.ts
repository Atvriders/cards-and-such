import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Lotto90State, Lotto90Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Lotto90 } from "./Lotto90.js";

export const lotto90Settings = {
  speed: {
    kind: "enum" as const,
    label: "Draw Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type Lotto90SettingsType = SettingsOf<typeof lotto90Settings>;

export const lotto90Plugin: GamePlugin<Lotto90State, Lotto90Action, typeof lotto90Settings> = {
  id: "lotto-90",
  title: "Lotto 90",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "European 90-number bingo. Match numbers on your 5×5 card. Score for lines; full house for max points!",
  howToPlay: `Lotto 90 is the classic European bingo format using numbers 1 through 90. You receive a 5×5 card filled with 25 unique numbers drawn randomly from that range.

Click "Draw Number" to call the next number from the shuffled bag. If the number appears on your card, it lights up green. The most recently drawn number shows in amber.

Score points by completing lines — any complete row, column, or diagonal earns 50 points. When a line is complete, a claim button becomes active (highlighted in yellow). Click the button to collect your 50 points. Each line can only be claimed once, so claim promptly!

Complete all 25 squares on your card to achieve a "Full House," which adds a bonus 200 points to your final score. The game ends when your card is fully marked or all 90 numbers have been drawn.

Strategy tip: early in the game, focus on which numbers you still need for nearly-complete lines. Lines with 4 marks need only one more number — keep track of how many have been drawn versus remain in the bag. The fewer numbers remain, the lower your odds, so complete your best lines first.

The draw speed setting affects the visual pacing only. Good luck — tombola!`,
  settings: lotto90Settings,
  initialState: (seed: number, settings: Lotto90SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Lotto90,
};

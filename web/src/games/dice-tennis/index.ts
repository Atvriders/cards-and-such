import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTennisState, DiceTennisAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTennis } from "./Game.js";

export const diceTennisSettings = {
  sets: {
    kind: "enum" as const,
    label: "Sets",
    options: ["1", "3"] as const,
    default: "1" as const,
  },
} as const;

type DiceTennisSettingsType = SettingsOf<typeof diceTennisSettings>;

export const diceTennisPlugin: GamePlugin<DiceTennisState, DiceTennisAction, typeof diceTennisSettings> = {
  id: "dice-tennis",
  title: "Dice Tennis",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to win rallies and games using flat, spin, or slice serves against an AI opponent.",
  howToPlay: `Dice Tennis simulates a tennis match using 3-dice rolls. You choose a serve style each point — the style sets the difficulty threshold that determines who wins the rally.

Three serve styles are available. Flat serve is a powerful gamble — you win the rally if the 3-dice total is 14 or higher, otherwise the AI wins the point. Spin serve is balanced — win on a total of 11 or more. Slice serve is the safe choice — win on a total of 9 or more (roughly 74% win rate).

Scoring follows real tennis conventions. Points go 0 → 15 → 30 → 40 → Game. When both players reach 40 (deuce), the next point wins the game for simplicity. Win 6 games to win a set (must be ahead by 2). In a 3-set match, first to win 2 sets wins the match.

A win earns 1000 points, a draw earns 500, and a loss earns 100.

Strategy: Use Slice to bank easy points when you are ahead in a game. Switch to Flat or Spin when you need to take risks to recover from 0-40 or break back. In a 3-set match, conserving your consistency across sets is key — do not go for broke every point.`,
  settings: diceTennisSettings,
  initialState: (seed: number, settings: DiceTennisSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DiceTennis,
};

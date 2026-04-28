import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToSuburbState, WelcomeToSuburbAction, WelcomeToSuburbSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToSuburbGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToSuburbPlugin: GamePlugin<WelcomeToSuburbState, WelcomeToSuburbAction, typeof settings> = {
  id: "welcome-to-suburb",
  title: "Welcome to Suburb",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip number cards and mark a 4x4 suburban street with house numbers.",
  howToPlay: `Welcome To... is a flip-and-write game where you build a 1950s suburb. In this adaptation you flip 12 random number cards (1-15) and place them on a 4x4 street (16 plots). Each plot must have a house number greater than the plot to its left in the same row.

For each flip, click any empty plot. If the number is greater than the number to its left (or the plot is leftmost), it's a valid placement; if not, the placement is forced as a bust (you mark it but score 0 for that house).

Scoring:
• Valid house: +2 points
• Bust house: +0
• Bonus +10 per fully-completed row of 4 in strict ascending order
• Bonus +5 per row with 3 valid houses in order
• Penalty −2 per fully-empty row at game end

The game runs 12 rolls. Plan: place high numbers far right, low numbers far left, and mid numbers in the middle. A perfect ascending row scores big. A strong run scores 25-40 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeToSuburbSettings),
  reducer,
  isTerminal,
  component: WelcomeToSuburbGame,
};

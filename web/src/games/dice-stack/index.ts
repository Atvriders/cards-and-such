import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DiceStackState, DiceStackAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStackGame } from "./Game.js";

export const diceStackPlugin = {
  id: "dice-stack",
  title: "Dice Stack",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice up to 3 times, keep the best, then score a Yahtzee-style category for 13 rounds!",
  howToPlay: `Dice Stack is a strategic dice game inspired by Yahtzee. Each round you roll five dice up to three times, keeping whichever dice you like between rolls. After your rolls, score one of 13 categories.

The scorecard has two sections. The upper section scores dice that match a number — Ones through Sixes — simply counting the total pips of that value. The lower section rewards combinations: Three of a Kind (sum of all dice), Four of a Kind (sum of all dice), Full House (three + two matching; 25 pts), Small Straight (four consecutive; 30 pts), Large Straight (five consecutive; 40 pts), Stack / Yahtzee (five of a kind; 50 pts!), and Chance (sum of all dice, always valid).

Each category can only be scored once. If you cannot or don't want to score a category legitimately, you may still put zero in it — choose carefully which categories to sacrifice.

After rolling, toggle which dice to keep, then roll again. When satisfied, click a category to score it. The round advances automatically. Play 13 rounds (one per category) or stop when all categories are filled. Aim for 300+ points for a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: DiceStackState, action: DiceStackAction) => DiceStackState,
  isTerminal,
  component: DiceStackGame,
} as unknown as GamePlugin;

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceLeapState, DiceLeapAction, DiceLeapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceLeapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const diceLeapPlugin: GamePlugin<DiceLeapState, DiceLeapAction, typeof settings> = {
  id: "dice-leap", title: "Dice Leap", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race a token from 0 to 50 by rolling dice. 1s send you back!",
  howToPlay: `Dice Leap is a single-track race against the clock. Your token starts at position 0 on a track that runs from 0 to 50. Press Roll to roll a six-sided die. The rolled value advances your token forward — except for 1s, which send you back 5 spaces (clamped to a minimum of 0).

You have a budget of 25 rolls to reach position 50. The expected value of a die roll is 3.5, but with the 1-penalty (rolling a 1 costs you 5 + missing 3.5 = 8.5 in net value), the expected forward motion per roll is closer to 2.83. So statistically, reaching 50 in fewer than 18 rolls is very lucky; in 25 rolls is achievable but not guaranteed.

Scoring: you earn (200 minus 5 times rolls used) points, plus a 100-point bonus if you reached the target. So a perfect blitz in 10 rolls would score 150 + 100 = 250. Failing to reach 50 in 25 rolls scores 75 (or whatever the formula returns).

Press Roll, watch the bar fill, and pray you don't see too many 1s. Good luck!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceLeapSettings),
  reducer, isTerminal, component: DiceLeapGame,
};

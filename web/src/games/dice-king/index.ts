import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceKingState, DiceKingAction, DiceKingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceKingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceKingPlugin: GamePlugin<DiceKingState, DiceKingAction, typeof settings> = {
  id:"dice-king", title:"Dice King", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Twelve rounds of three-dice rolls. Sum scores plus pair and triple bonuses.",
  howToPlay:`Dice King is a 12-round dice game where you simply roll and sum. Each round, three six-sided dice are rolled. Your score for the round is the sum of the dice (3 to 18 base) plus pattern bonuses:

- All three same (triple): +20 bonus on top of the sum.
- Exactly two of a kind (pair): +5 bonus.
- All three different: just the sum, no bonus.

The game tracks your highest single-roll sum across all rounds — try for that triple-six (sum 18, plus the 20 bonus = 38 points in one round).

There are no choices to make — just roll and watch the dice fall. Average single-round score is around 11.5; over 12 rounds, expect a total of about 140 points. A few timed pairs and one lucky triple will push you well above 200.

Will you be crowned the Dice King? Roll on!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceKingSettings),
  reducer,isTerminal,component:DiceKingGame,
};

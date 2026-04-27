import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMarathonState, DiceMarathonAction, DiceMarathonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMarathonGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMarathonPlugin: GamePlugin<DiceMarathonState, DiceMarathonAction, typeof settings> = {
  id:"dice-marathon", title:"Dice Marathon", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 100 dice. Track distribution. Score = total pips.",
  howToPlay:"Dice Marathon is exactly what it sounds like: roll 100 standard six-sided dice and track the distribution. Your score is the total pips (face values summed) across all rolls.\n\nThe expected mean roll is 3.5, so the expected total is 350 pips. Lucky rolls land closer to 380; unlucky runs sink to 320. There's no decision to make and no skill — just a long roll session displaying the live histogram of your distribution as it builds.\n\nPress \"Roll 1\" to add one die at a time, or \"Roll All\" to finish the marathon instantly. The histogram shows how many of each face (1-6) you've rolled, with horizontal bars scaled to the most-rolled face. By the end, all six bars should be roughly equal — the law of large numbers in action.\n\nDice Marathon is more of a statistical curiosity than a competitive challenge. Watch the variance, marvel at the distribution, and lock in whatever score the dice gods give you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMarathonSettings),
  reducer,isTerminal,component:DiceMarathonGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceArrowState, DiceArrowAction, DiceArrowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceArrowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceArrowPlugin: GamePlugin<DiceArrowState, DiceArrowAction, typeof settings> = {
  id:"dice-arrow", title:"Dice Arrow", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll until you hit a 6. Faster hits score more. 10 rounds.",
  howToPlay:`Dice Arrow is a quick-strike dice mini themed around finding the elusive face-six. Each round, the game rolls a die over and over until a 6 appears. Your score for the round is 60 minus 4 times the number of rolls it took, floored at zero.

So a one-shot 6 scores 56 points (the maximum); two rolls scores 52; ten rolls scores 20; sixteen-plus rolls scores zero. The expected number of rolls to see a 6 is exactly 6 (geometric distribution with p=1/6), giving an average score of 60 - 24 = 36 per round.

You play 10 rounds. Average expected scores land near 360; lucky runs of fast 6s can push past 500. There's no skill — just press Shoot, watch the rolls fly, and feel the satisfying snap when the 6 finally lands. Quick, repetitive, gambler's-delight fun!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceArrowSettings),
  reducer,isTerminal,component:DiceArrowGame,
};

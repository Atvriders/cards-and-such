import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceArcheologyState, DiceArcheologyAction, DiceArcheologySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceArcheologyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceArcheologyPlugin: GamePlugin<DiceArcheologyState, DiceArcheologyAction, typeof settings> = {
  id:"dice-archeology", title:"Dice Archeology", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to dig — only sixes uncover ancient treasure!",
  howToPlay:`Dice Archeology is a 10-round dice game with an excavation theme. Each round, you roll one six-sided die. Only a roll of 6 (the rare, perfect strike) uncovers an ancient treasure, scoring 30 points. Rolls of 1 through 5 are dust and dirt — zero points.

Press Roll Die for each dig. The probability of rolling a 6 is 1/6 (about 16.7%), so expected total score is around 50 points (10 rolls × 30 × 1/6). A perfect run scores 300, while an unlucky session might find no treasure at all (0 points).

There are no choices to make — just roll and hope for sixes. The high payoff per success makes this a thrilling game of variance: you might end with a windfall of artifacts or walk away empty-handed. Archeology isn't always rewarding — but when it is, it pays!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceArcheologySettings),
  reducer,isTerminal,component:DiceArcheologyGame,
};

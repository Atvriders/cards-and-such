import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBlacksmithState, DiceBlacksmithAction, DiceBlacksmithSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBlacksmithGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBlacksmithPlugin: GamePlugin<DiceBlacksmithState, DiceBlacksmithAction, typeof settings> = {
  id:"dice-blacksmith", title:"Dice Blacksmith", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Forge swords with three dice. Pairs and triples mean strong steel.",
  howToPlay:"Dice Blacksmith is a 10-round dice mini themed around a forge. Each round you roll three dice representing hammer strikes on the anvil. Matching strikes mean the steel is folded cleanly:\\n\\n- Three matching dice (a triple): score 30 points (perfect strike).\\n- Any pair of matching dice: score 15 points (clean strike).\\n- All different: score 0 points (the steel is uneven).\\n\\nPress Forge to roll the three dice for the round, see your strike result, then press Next to move to the next forging.\\n\\nThere are 10 rounds. The probability of rolling at least a pair on three dice is about 44%, so on average you'll forge clean steel on roughly 4-5 rounds. Average expected scores fall around 70-90 points. Roll three perfect triples and you've made a legendary blade. Hammer down!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBlacksmithSettings),
  reducer,isTerminal,component:DiceBlacksmithGame,
};

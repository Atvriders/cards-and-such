import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTreasureState, DiceTreasureAction, DiceTreasureSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTreasureGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTreasurePlugin: GamePlugin<DiceTreasureState, DiceTreasureAction, typeof settings> = {
  id:"dice-treasure", title:"Dice Treasure", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dice unlock treasure chests when the sum is high.",
  howToPlay:"Dice Treasure is a quick dice game with simple, satisfying scoring. Each round, two six-sided dice are rolled, and points are awarded based on the result.\n\nSums of 8 or higher unlock a chest worth 25 + sum; everything else pays 5. 10 rounds.\n\nPress Roll to play the round, then press Next to advance. There are no choices — every game is pure variance, but watching the score climb makes it irresistible. Try to chase a personal best by replaying with different seeds.\n\nTotal score depends on how often the dice cooperate. Some rounds will pay zero, others will pay big. With multiple rounds you'll usually average something in the middle of the range — but a hot streak can push your run far higher. Roll, watch, repeat!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTreasureSettings),
  reducer,isTerminal,component:DiceTreasureGame,
};

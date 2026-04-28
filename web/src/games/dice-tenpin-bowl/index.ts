import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTenpinBowlState, DiceTenpinBowlAction, DiceTenpinBowlSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTenpinBowlGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTenpinBowlPlugin: GamePlugin<DiceTenpinBowlState, DiceTenpinBowlAction, typeof settings> = {
  id:"dice-tenpin-bowl", title:"Dice Ten-Pin Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"10 frames of 2-die rolls = pins down.",
  howToPlay:"Ten-Pin Dice Bowl is a quick 10-frame bowling sim using two six-sided dice. In each frame you roll the dice and the sum (2 to 12) represents pins knocked down for that frame. Add up the totals across all 10 frames for your final score.\n\nExpected pins per frame is around 7, so an average game lands near 70. A hot streak can push you over 100, while cold rolls slip below 50. The maximum possible — twelve every frame — is 120. Press Roll to bowl, then Next to move on to the next frame.\n\nNo spares, strikes, or special bonus math here — it's the cleanest possible bowling distillation. Real ten-pin punishes you for splits and rewards strikes and consecutive marks; this mini just rewards the dice. Quick, satisfying, and great as a 60-second bowling fix between bigger games or quizzes.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTenpinBowlSettings),
  reducer,isTerminal,component:DiceTenpinBowlGame,
};

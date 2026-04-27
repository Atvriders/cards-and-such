import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBowlState, DiceBowlAction, DiceBowlSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBowlGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBowlPlugin: GamePlugin<DiceBowlState, DiceBowlAction, typeof settings> = {
  id:"dice-bowl", title:"Dice Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bowling-style dice scoring. 10 frames, roll 10 dice each. 4-6 = pin down. Strike +10 bonus.",
  howToPlay:`Dice Bowl reimagines ten-pin bowling with dice. Each frame you roll 10 dice — each die represents a pin. Pins showing 4, 5, or 6 are "knocked down" and count toward your score; pins showing 1, 2, or 3 stay up.

You score points equal to the number of pins knocked down each frame. If all 10 pins fall (a STRIKE), you also collect a +10 bonus, so a perfect frame is worth 20 points.

The probability of any given die landing 4-6 is 50%, so the average frame knocks down 5 pins. A strike requires all 10 dice to land 4 or higher — about a 1 in 1024 shot per frame, so strikes are very rare.

Across 10 frames the expected score is around 50; great runs land 60+, and a single lucky strike can push the total over 70. Two strikes in one game is genuinely impressive. Press Bowl to roll, then Next to advance frames.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBowlSettings),
  reducer,isTerminal,component:DiceBowlGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogDiceState, HogDiceAction, HogDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HogDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hogDicePlugin: GamePlugin<HogDiceState, HogDiceAction, typeof settings> = {
  id:"hog-dice", title:"Hog Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hog: bet n dice, all-or-nothing. 10 rounds; auto-bet 4 dice each round.",
  howToPlay:"Hog is the all-in cousin of Pig, where instead of pressing-your-luck per roll, you commit to a single big throw of N dice. If any of those dice show a 1, your entire roll busts to zero. Otherwise you keep the full sum.\n\nIn this version you auto-bet four dice every round across 10 rounds. The four dice are rolled simultaneously: if any show a 1, the round scores 0 (Hog!). Otherwise you score the full dice sum (typically 8-24).\n\nProbability calculation: each die avoids 1 with 5/6 chance; for four dice the chance of all surviving is (5/6)^4 ≈ 48.2%. So roughly half of all rounds bust outright. The 51.8% winning rounds average around 16 points each, giving a session average of 60-100 points.\n\nFast, all-or-nothing decision-making distilled into pure dice luck. The Hog is unforgiving but generous when she favors you.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HogDiceSettings),
  reducer,isTerminal,component:HogDiceGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceQuestState, DiceQuestAction, DiceQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceQuestPlugin: GamePlugin<DiceQuestState, DiceQuestAction, typeof settings> = {
  id:"dice-quest", title:"Dice Quest", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mini-quest: dice rolls determine each stage outcome. 8 stages.",
  howToPlay:"Dice Quest is an 8-stage adventure where you choose the next path: Forest (1d6 ×2 reward), Cave (1d8 +stealth bonus), or Mountain (1d10 high payoff).\n\nForest is the safest — every roll yields 2 to 12 points (1d6 doubled). Cave rolls 1d8 and adds 3 stealth bonus on rolls of 1-4 (totaling 4-12). Mountain rolls 1d10 raw — you earn whatever you roll, with potential for 10 but possible single-digit lows.\n\nTap a path to journey. Watch the dice roll and your reward tally. Press Next to advance to the next stage.\n\nThe expected values are similar (Forest ≈ 7, Cave ≈ 6, Mountain ≈ 5.5), so the choice is about variance and flavor. A heroic 8-stage run scores 50-80 points; perfect Mountain runs can crack 80, while solid Forest paths land 40-70. Dice Quest is a story-flavored dice mini.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceQuestSettings),
  reducer,isTerminal,component:DiceQuestGame,
};

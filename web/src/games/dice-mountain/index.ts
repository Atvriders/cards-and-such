import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMountainState, DiceMountainAction, DiceMountainSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMountainGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMountainPlugin: GamePlugin<DiceMountainState, DiceMountainAction, typeof settings> = {
  id:"dice-mountain", title:"Dice Mountain", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Climb a mountain to altitude 100 by rolling two dice — fewer rolls earn more points.",
  howToPlay:"Dice Mountain is a quick climbing game with a single goal: reach altitude 100 by rolling two dice each turn. Each roll's sum adds to your altitude. The fewer rolls you take to reach the summit, the more points you score.\n\nPress Climb to roll. The result is added to your altitude immediately. Once you cross 100, the game ends and your score is computed: 200 minus 5 points per roll, with a floor of zero. So if you summit in 12 rolls you score 140; in 20 rolls you score 100; if you take 40 rolls or more, you score zero. The minimum sum is 2 and maximum 12, so the absolute fastest theoretical climb is 9 rolls (worth 155 points).\n\nMost runs land between 14 and 17 rolls. There's no skill — just dice cooperation. Roll quickly to see how the dice treat you and how high your score climbs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMountainSettings),
  reducer,isTerminal,component:DiceMountainGame,
};

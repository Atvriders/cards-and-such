import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHarvestState, DiceHarvestAction, DiceHarvestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHarvestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceHarvestPlugin: GamePlugin<DiceHarvestState, DiceHarvestAction, typeof settings> = {
  id:"dice-harvest", title:"Dice Harvest", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Harvest dice fields: sum >= 9 wins. 10 rounds.",
  howToPlay:"Dice Harvest is a 10-round farming-themed dice mini. Each round you roll two dice to harvest a field. A sum of 9 or higher is a bumper crop and scores 10 points; sums of 8 or lower yield poor harvests for no points.\n\nThe probability of sum >= 9 with two dice is 10/36, about 27.8%. So expected scores are around 28 points across 10 rounds — the game leans hard, making big rolls feel meaningful.\n\nThere's no skill — just press Roll, see your dice, watch the harvest play out. The farming flavor (wheat, corn, barley) is purely cosmetic; mechanically it's a high-threshold dice mini. Most rounds will fail, so each successful harvest is a celebration. Lucky farmers can score 50+ points in a single game; average farmers should expect around 20-30. Either way, the wheat must flow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceHarvestSettings),
  reducer,isTerminal,component:DiceHarvestGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ValeriaCardKingdomsState, ValeriaCardKingdomsAction, ValeriaCardKingdomsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ValeriaCardKingdomsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const valeriaCardKingdomsPlugin: GamePlugin<ValeriaCardKingdomsState, ValeriaCardKingdomsAction, typeof settings> = {
  id:"valeria-card-kingdoms",
  title:"Valeria Card Kingdoms",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Recruit citizens for kingdom score.",
  howToPlay:"Valeria Card Kingdoms is a 10-round fantasy recruitment game where each round you draw three citizen cards from a 7-class deck: Peasant (1), Soldier (2), Knight (3), Mage (4), Priest (5), Noble (6), and Royal (7). Sum the values for your round score. 🏰\n\nNo choices, just rhythm and discovery. The mid-tier classes appear most often; Royals are rare. Across 10 rounds expect totals between 100 and 180. A Royal trio is a one-in-a-thousand miracle — but oh, the boast.\n\nPress Draw to summon your three citizens, then Next to recruit again. Watch your kingdom score grow in the upper right. Score 130+ to rule a thriving Valeria. Each card displays its class name and value. The game finishes in well under a minute and gives you a quick fantasy hit. A perfect tiny break game.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ValeriaCardKingdomsSettings),
  reducer,
  isTerminal,
  component:ValeriaCardKingdomsGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionProsperityState, DominionProsperityAction, DominionProsperitySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionProsperityGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionProsperityPlugin: GamePlugin<DominionProsperityState, DominionProsperityAction, typeof settings> = {
  id:"dominion-prosperity",
  title:"Dominion Prosperity",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"High-cost Treasures and Colonies.",
  howToPlay:"Dominion Prosperity is a ten-round opulent variant inspired by the high-cost Treasure expansion adding Platinum and Colony cards to the Dominion family. Three cards reveal each round from an enriched deck: Copper (2), Silver (3), Gold (4), Platinum (6) and Province (5). The sum of three drawn cards scores you points. 💰\n\nWith higher-cost Treasures present, the average draw is richer — closer to 12 per round than the standard 9. Across ten rounds expect totals between 100 and 130, possibly higher with lucky Platinum stacks.\n\nPress Draw to reveal three cards, Next to advance, or Finish on round ten. Aim for 120+ to build a Prosperity-worthy tableau. The game completes in under a minute — capturing the gilded feel of the original expansion in a fast, breezy session that you can replay countless times in a coffee break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionProsperitySettings),
  reducer,
  isTerminal,
  component:DominionProsperityGame,
};

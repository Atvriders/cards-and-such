import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysticValeCraftState, MysticValeCraftAction, MysticValeCraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MysticValeCraftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mysticValeCraftPlugin: GamePlugin<MysticValeCraftState, MysticValeCraftAction, typeof settings> = {
  id:"mystic-vale-craft",
  title:"Mystic Vale Craft",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Craft cards from elemental components.",
  howToPlay:"Mystic Vale Craft is a 10-round card-crafting game where each round draws three elemental components from a fantasy deck: Earth (2), Air (3), Fire (4), Water (5), and Spirit (6). Sum the values for your base round score. 🌿\n\nIf any two components in a round are the same element — an elemental harmony — you earn an additional 4-point harmony bonus. Triple-harmony grants 8 instead. Average rounds score around 10 points; harmonies push that up. Across 10 rounds, expect 100 to 140 total.\n\nPress Draw to reveal three crafted components, then Next to continue crafting. The crisp UI shows each component's element and value. Score 130+ to be a Mystic Vale grandmaster. Quick, peaceful, and meditative — a small ritual of nature spirits and elemental harmony. Finishes in well under a minute, perfect for a serene fantasy break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MysticValeCraftSettings),
  reducer,
  isTerminal,
  component:MysticValeCraftGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourSoulsIsaacState, FourSoulsIsaacAction, FourSoulsIsaacSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourSoulsIsaacGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fourSoulsIsaacPlugin: GamePlugin<FourSoulsIsaacState, FourSoulsIsaacAction, typeof settings> = {
  id:"four-souls-isaac",
  title:"Four Souls Isaac",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deckbuilder based on Binding of Isaac video game.",
  howToPlay:"Four Souls Isaac is a ten-round deckbuilder homage to Studio 71's The Binding of Isaac: Four Souls, the spinoff of Edmund McMillen's hit video game. Each round, three cards reveal from a thematic deck: Item (4), Loot (2), Monster (3), Soul (6), Curse (1). The total is your round score. 👁️\n\nThe Curse card is a low-roll danger; Soul cards are the prize. The deck averages 10 per round, with Soul-rich rounds reaching 14+. Across ten rounds expect totals between 90 and 120.\n\nPress Draw to flip three cards, Next to advance the loot run, and Finish on round ten. Aim for 120+ to claim four souls. The game completes in well under a minute, distilling the loot-pulling chaos of Four Souls into a compact and re-playable card session, perfect for any quick break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FourSoulsIsaacSettings),
  reducer,
  isTerminal,
  component:FourSoulsIsaacGame,
};

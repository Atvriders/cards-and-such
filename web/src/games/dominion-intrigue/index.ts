import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionIntrigueState, DominionIntrigueAction, DominionIntrigueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominionIntrigueGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dominionIntriguePlugin: GamePlugin<DominionIntrigueState, DominionIntrigueAction, typeof settings> = {
  id:"dominion-intrigue",
  title:"Dominion Intrigue",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Intrigue victory-card combos and attack chains.",
  howToPlay:"Dominion Intrigue is a small ten-round tableau-builder inspired by the classic Dominion expansion known for its Victory-card combos and attack-style cards. Each round, three cards are revealed from a deck of fantasy denominations: Copper (2), Silver (3), Gold (4) and dual-purpose Estates worth either 1 or 5 points. The sum of the three drawn cards is added to your running score. 🗡️\n\nRather than letting players choose, the cards reveal themselves automatically — capturing the engine-rhythm without the decision overhead of full Dominion. Sums of around 9 are typical per round; lucky Estate-heavy rounds can reach 15 and beyond.\n\nPress Draw to reveal the cards, then Next to move on, or Finish on the final round. Across ten rounds expect totals near 80 to 100. Aim for 100+ to truly weave together a great Intrigue tableau. The whole game completes in well under a minute, capturing the fast feel of an Intrigue play in pocket form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DominionIntrigueSettings),
  reducer,
  isTerminal,
  component:DominionIntrigueGame,
};

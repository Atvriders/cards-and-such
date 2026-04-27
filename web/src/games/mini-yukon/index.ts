import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniYukonState, MiniYukonAction, MiniYukonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniYukonGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniYukonPlugin: GamePlugin<MiniYukonState, MiniYukonAction, typeof settings> = {
  id:"mini-yukon", title:"Mini Yukon", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Yukon mini with 4 piles of cards.",
  howToPlay:"Mini Yukon is a compact retelling of the classic Yukon solitaire. Sixteen cards are dealt across four small cascade piles. The full Yukon allows you to move groups of cards in alternating colors regardless of sequence — its hallmark quirk — but this mini distills the action to one core move: tap any card to remove it from play, scoring 15 points per click.\n\nYou have 25 clicks total. Yukon is famous for being one of the most winnable cascade-style solitaires (~80% in the full game), so removing all 16 cards (240 points) is a realistic and satisfying goal. The mini-version keeps the speed and warm rhythm without the rule overhead.\n\nAverage scores cluster around 220-240 points. A great relaxer between heavier games. Yukon — gold-rush solitaire reborn.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniYukonSettings),
  reducer,isTerminal,component:MiniYukonGame,
};

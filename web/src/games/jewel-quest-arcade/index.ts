import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JewelQuestArcadeState, JewelQuestArcadeAction, JewelQuestArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JewelQuestArcadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jewelQuestArcadePlugin: GamePlugin<JewelQuestArcadeState, JewelQuestArcadeAction, typeof settings> = {
  id:"jewel-quest-arcade", title:"Jewel Quest Arcade", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Adventure-themed match-3 with relics and treasure.",
  howToPlay:"Jewel Quest Arcade is a sixty-second relic-themed match-three adventure. The six-by-six grid is filled with rings, coins, keys, gems, urns, and pottery — all the spoils of a digital archaeologist. Click adjacent relics to swap them. Whenever a swap creates three or more matching relics in a row or column, those relics are cleared for ten points each. New relics fall in from above to refill the board, and you'll often trigger cascading bonus chains. Invalid swaps simply cancel. Unlike the original Jewel Quest, this version focuses on speed scoring — the timer counts down in the corner and locks your final score when it hits zero. Plan adjacent matches efficiently to maximize cascades. Average runs land near 300 points; treasure hunters chasing chain cascades regularly score over 500. Click, swap, and uncover the riches of every match!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JewelQuestArcadeSettings),
  reducer,isTerminal,component:JewelQuestArcadeGame,
};

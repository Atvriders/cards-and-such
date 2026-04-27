import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBaccaratState, DiceBaccaratAction, DiceBaccaratSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBaccaratGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBaccaratPlugin: GamePlugin<DiceBaccaratState, DiceBaccaratAction, typeof settings> = {
  id:"dice-baccarat", title:"Dice Baccarat", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet Player, Banker, or Tie before two dice are rolled for each side. Sums mod 10; ten rounds.",
  howToPlay:`Dice Baccarat is a simple dice translation of the casino card classic. Each round, you bet on one of three outcomes: Player, Banker, or Tie. After your bet, two dice are rolled for the Player and two more for the Banker. Each side's score is the sum of its two dice taken modulo 10 — so a roll of 6+5=11 counts as 1, just like in real baccarat. The higher mod-10 score wins.

If you bet Player or Banker correctly, you score 10 points. A correct Tie bet pays a hefty 30 points (3-to-1) because ties are uncommon — only about 1 in 8 rounds.

There are 10 rounds. Player and Banker each win roughly 44% of the time in this dice version, so picking either is roughly a coin flip and yields about 40 expected points across 10 rounds. Ties expectation is 30/8 = 3.75 per round = 37.5 total, only marginally lower. The result is a quick, breezy mini that captures the rhythm of baccarat without the cards.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBaccaratSettings),
  reducer,isTerminal,component:DiceBaccaratGame,
};

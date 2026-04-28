import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMashState, CardMashAction, CardMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardMashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMashPlugin: GamePlugin<CardMashState, CardMashAction, typeof settings> = {
  id:"card-mash", title:"Card Mash", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mash cards by suit: count matches across 12 rounds.",
  howToPlay:"Card Mash is a 12-round suit-counting card mini. Each round you are given a target suit and dealt 5 random cards. Every card matching the target suit awards 15 points; matching all 5 nets 75. Mismatches just sit there, harmless and pointless.\n\nPress Deal 5 to draw your hand. The matching cards are highlighted automatically so you can see exactly how the round shook out. Press Next to advance to the next deal: the target suit is re-randomized each round.\n\nAverage matches per round are 1.25 (5 cards times 25 percent suit chance), so a typical run scores around 225 points across 12 rounds. Lucky draws of 3 or more matches in a single round add up fast: keep an eye out for the suit-rich hands and ride the variance.\n\nThere is no wrong choice and no skill component: Card Mash is pure card-flop entertainment, perfect for a quick session between bigger games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMashSettings),
  reducer,isTerminal,component:CardMashGame,
};

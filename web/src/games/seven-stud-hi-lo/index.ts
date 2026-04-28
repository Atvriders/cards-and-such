import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenStudHiLoState, SevenStudHiLoAction, SevenStudHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenStudHiLoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sevenStudHiLoPlugin: GamePlugin<SevenStudHiLoState, SevenStudHiLoAction, typeof settings> = {
  id:"seven-stud-hi-lo", title:"7-Card Stud Hi-Lo Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Seven-Card Stud Hi-Lo: seven cards dealt, best five-card poker hand scored.",
  howToPlay:"7-Card Stud Hi-Lo Solo (8-or-Better) translates the classic stud deal into a quick solo poker rating round. Press Deal each round to receive seven random cards from a 52-card deck — the seven cards a player would have at showdown in real Stud.\n\nThe best five-card poker hand is scored: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn real 7-Card Stud Hi-Lo, the pot is split between best high and qualifying low (eight or better). This solo deals you the seven cards and scores the high half — the most reliable point earner.\n\nEight rounds. Stud's seven-card spread produces about the same hand distribution as Hold'em — expect plenty of two pair and trips. Press Next between rounds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SevenStudHiLoSettings),
  reducer,isTerminal,component:SevenStudHiLoGame,
};

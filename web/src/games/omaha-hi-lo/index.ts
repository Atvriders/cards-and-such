import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiLoState, OmahaHiLoAction, OmahaHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmahaHiLoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const omahaHiLoPlugin: GamePlugin<OmahaHiLoState, OmahaHiLoAction, typeof settings> = {
  id:"omaha-hi-lo", title:"Omaha Hi-Lo Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Omaha Hi-Lo: deal nine cards, score best high hand.",
  howToPlay:"Omaha Hi-Lo Solo (8-or-Better) brings the split-pot Omaha experience to a solo deal. Press Deal each round and you'll receive nine cards (four hole + five community) from a 52-card deck.\n\nThe high hand is scored automatically using standard poker rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live Omaha Hi-Lo, half the pot goes to the best high and half to the best low (eight or better required). This solo version focuses on the high half — the dominant scoring concept — but expect more middle-range hands because some cards are pulled toward low-qualifying values.\n\nSeven rounds total. Watch for big hands every time a board pair appears. Press Next between rounds and aim for a record session!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmahaHiLoSettings),
  reducer,isTerminal,component:OmahaHiLoGame,
};

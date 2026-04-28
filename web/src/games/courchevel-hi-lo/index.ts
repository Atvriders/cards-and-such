import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CourchevelHiLoState, CourchevelHiLoAction, CourchevelHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CourchevelHiLoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const courchevelHiLoPlugin: GamePlugin<CourchevelHiLoState, CourchevelHiLoAction, typeof settings> = {
  id:"courchevel-hi-lo", title:"Courchevel Hi-Lo Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Courchevel Hi-Lo: ten cards, best high-hand five-card poker score.",
  howToPlay:"Courchevel Hi-Lo Solo is the split-pot variant of Courchevel boiled down to a solo dealer game. Press Deal each round and receive ten cards from a 52-card deck (five hole + five community); the best five-card poker hand is scored as the high half.\n\nHand rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn the live game an eight-or-better low hand qualifies for half the pot, but here we focus on the high half — the more reliably scoring side of the equation.\n\nSix rounds. Because the wide deal makes plenty of low cards likely, expect more Pair and Two Pair hands than in straight high-only Courchevel. Press Next between rounds and try multiple seeds to compare your average.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CourchevelHiLoSettings),
  reducer,isTerminal,component:CourchevelHiLoGame,
};

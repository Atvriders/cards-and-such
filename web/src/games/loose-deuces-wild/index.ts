import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LooseDeucesWildState, LooseDeucesWildAction, LooseDeucesWildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LooseDeucesWildGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const looseDeucesWildPlugin: GamePlugin<LooseDeucesWildState, LooseDeucesWildAction, typeof settings> = {
  id:"loose-deuces-wild", title:"Loose Deuces Wild (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Loose Deuces video poker: variant where deuces are wild and minimum paying hand is five-of-a-kind. Deal five cards.",
  howToPlay:"Loose Deuces Wild is a high-volatility video-poker paytable where deuces are wild and the minimum paying hand jumps up to five-of-a-kind — every other hand pays nothing, but the big hits pay much more. This solo trainer ignores the wild-card and minimum-hand rules; it just deals five cards and scores them under the standard hand ranking so you can enjoy the deal-and-react flow.\n\nPress Deal each round to receive five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Whenever a deuce drops into your hand, raise an eyebrow — in real Loose Deuces it would have been a wild card, possibly the bridge to a quads or straight flush. Press Next between rounds and chase the strongest cumulative score over your full ten-deal session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LooseDeucesWildSettings),
  reducer,isTerminal,component:LooseDeucesWildGame,
};

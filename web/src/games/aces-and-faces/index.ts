import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcesAndFacesState, AcesAndFacesAction, AcesAndFacesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcesAndFacesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const acesAndFacesPlugin: GamePlugin<AcesAndFacesState, AcesAndFacesAction, typeof settings> = {
  id:"aces-and-faces", title:"Aces and Faces (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Aces and Faces video poker: deal five cards and score the best hand using the Aces and Faces paytable theme.",
  howToPlay:"Aces and Faces is a popular video-poker paytable that rewards face-card four-of-a-kinds and aces with bonus payouts on top of the standard ranking. This solo trainer focuses on the deal itself — receive a five-card hand from a fresh 52-card deck and score it under the standard hand-rank table.\n\nPress Deal each round to receive five random cards. Hand values used here: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. In a real Aces and Faces machine you would also see big multipliers for four aces and four jacks/queens/kings — here the standard ranking captures the big-hand thrill.\n\nThere are ten independent rounds. Press Next between rounds and chase the highest cumulative score across your video-poker session — every quad you stumble into is a celebratory sound effect waiting to happen.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AcesAndFacesSettings),
  reducer,isTerminal,component:AcesAndFacesGame,
};

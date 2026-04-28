import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFanState, CardFanAction, CardFanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFanGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFanPlugin: GamePlugin<CardFanState, CardFanAction, typeof settings> = {
  id:"card-fan", title:"Card Fan", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fan out 5 cards and pick the highest: 12 rounds.",
  howToPlay:"Card Fan dispatches 5 random cards each round in a clear horizontal row, and you must tap the one with the highest rank. Aces sit at the top (rank 12 internally: beats King, Queen, Jack, etc.). Hit the top rank and score a clean 30 points; pick wrong and earn nothing.\n\nSuits do not matter: only rank. If two cards tie for highest rank (rare with 5 random draws but possible after the 4-of-a-kind chance), only the leftmost tied card is the correct pick. So focus on rank symbols, not suits.\n\nPress Next to advance. Across 12 rounds, perfect play (always picking the highest) yields 360 points. Random play (1-in-5 odds) averages around 72 points. With careful rank reading, scores of 300 or more are routine; 360 is the ceiling.\n\nCard Fan is the simplest card mini in the bunch: just identify the highest and tap. Quick, clean, and a great warm-up game between deeper sessions. Fan, scan, tap, advance!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFanSettings),
  reducer,isTerminal,component:CardFanGame,
};

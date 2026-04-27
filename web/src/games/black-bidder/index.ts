import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackBidderState, BlackBidderAction, BlackBidderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackBidderGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackBidderPlugin: GamePlugin<BlackBidderState, BlackBidderAction, typeof settings> = {
  id:"black-bidder", title:"Black Bidder", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Guess if the next card will be black. 10 rounds; +10 per correct call.",
  howToPlay:`Black Bidder is a tiny prediction card game and the mirror of Red Roulette. Each round, you choose whether the next card flipped will be black (spades or clubs) or red (hearts or diamonds). The card is then revealed; if you guessed correctly, you score 10 points.

There are 10 rounds total. Each card is drawn fresh from a shuffled deck so your odds remain a clean fifty-fifty every round. The maximum score is 100; an average run lands around 50. Hit 70 or higher and the cards have been kind to you.

After each round, press Next to continue. Press Black or Red to lock in your call. There's nothing to memorize, no card-counting to attempt — just press a button and find out. Quick, simple, and the perfect lazy-afternoon game.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackBidderSettings),
  reducer,isTerminal,component:BlackBidderGame,
};

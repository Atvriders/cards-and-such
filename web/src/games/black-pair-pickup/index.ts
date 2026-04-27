import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackPairPickupState, BlackPairPickupAction, BlackPairPickupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackPairPickupGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackPairPickupPlugin: GamePlugin<BlackPairPickupState, BlackPairPickupAction, typeof settings> = {
  id:"black-pair-pickup", title:"Black Pair Pickup", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick up black card pairs over 14 rounds.",
  howToPlay:"Black Pair Pickup is a fast hand-of-two card mini. Each round you're dealt 2 random cards from a standard 52-card deck. If both cards are black (Spades or Clubs), you score 30 points; otherwise 0. There are 14 rounds total — short, snappy, and pure RNG fun.\n\nThe probability of being dealt two black cards is roughly 24.5% (26/52 × 25/51). Across 14 rounds the expected value is about 100 points; lucky streaks can push you to 200+ for top scores. Press Deal to roll the cards, then Next to advance to the next round.\n\nA perfect game (every round black-black) yields 420 points but is exceedingly rare. Average runs land near 90-110 points. The dark-suit twin to Red Pair Pickup — a quick rhythm game between heavier rounds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackPairPickupSettings),
  reducer,isTerminal,component:BlackPairPickupGame,
};

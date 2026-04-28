import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrazyPineappleState, CrazyPineappleAction, CrazyPineappleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrazyPineappleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crazyPineapplePlugin: GamePlugin<CrazyPineappleState, CrazyPineappleAction, typeof settings> = {
  id:"crazy-pineapple", title:"Crazy Pineapple Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Crazy Pineapple: three hole + four community simulated; best five-card hand scored.",
  howToPlay:"Crazy Pineapple Solo is the wild cousin of Pineapple. In live Crazy Pineapple, players receive three hole cards and must discard one AFTER the flop is dealt, leading to bizarre post-flop decisions. Here, press Deal to receive seven cards (three hole + four community) and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThe post-flop discard in the live game creates extra information for opponents — pretending it's not Crazy Pineapple is hard. Here the seven-card seeded deal abstracts those tactics into pure variance.\n\nEight rounds. The seven-card spread produces frequent two-pair and trips outcomes. Press Next between rounds and aim for Full Houses and Quads.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrazyPineappleSettings),
  reducer,isTerminal,component:CrazyPineappleGame,
};

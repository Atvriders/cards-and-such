import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineappleOfcState, PineappleOfcAction, PineappleOfcSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineappleOfcGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pineappleOfcPlugin: GamePlugin<PineappleOfcState, PineappleOfcAction, typeof settings> = {
  id:"pineapple-ofc", title:"Pineapple OFC Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Pineapple OFC: 17 cards dealt total, best five-card high scored.",
  howToPlay:"Pineapple OFC Solo is the high-action variant of Open-Face Chinese where players draw three cards each turn and discard one. Press Deal each round to receive 17 cards from a 52-card deck — your full Pineapple OFC card pool — and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live Pineapple OFC, the three-card draws plus discards create complex set-play decisions. Here the abstraction is simple: 17 cards, best five-card hand wins.\n\nThree rounds — short and intense. With 17 cards you should expect Full Houses or better every round. Press Next between rounds and chase the rare Straight Flush.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PineappleOfcSettings),
  reducer,isTerminal,component:PineappleOfcGame,
};

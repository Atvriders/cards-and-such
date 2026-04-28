import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoseMixState, HoseMixAction, HoseMixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoseMixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hoseMixPlugin: GamePlugin<HoseMixState, HoseMixAction, typeof settings> = {
  id:"hose-mix", title:"HOSE Mix Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo HOSE rotation: Hold'em/Omaha/Stud/8orBetter mix; best five-card high scored.",
  howToPlay:"HOSE Mix Solo is HORSE without Razz — a four-game rotation of Hold'em, Omaha Hi-Lo, Stud, and Stud 8-or-Better. Press Deal each round to receive six cards and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nBy dropping Razz from the rotation, HOSE removes the lowball scoring variance — the result is a more predictable rotation. Here the seeded six-card deal each round provides similar consistency.\n\nTen rounds. Expect a steady mid-range output with frequent two pair and trips. Press Next between rounds and run a few full sessions to gauge your average.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HoseMixSettings),
  reducer,isTerminal,component:HoseMixGame,
};

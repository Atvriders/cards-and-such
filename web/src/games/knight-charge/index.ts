import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnightChargeState, KnightChargeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnightCharge } from "./KnightCharge.js";
export const knightChargeSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof knightChargeSettings>;
export const knightChargePlugin:GamePlugin<KnightChargeState,KnightChargeAction,typeof knightChargeSettings> = {
  id:"knight-charge",title:"Knight Charge",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to charge your knight across the battlefield and score points.",
  howToPlay:`Knight Charge is a rapid-tap arcade game. Each round your knight must charge across the battlefield, requiring a specific number of taps to cover the distance. Watch the progress counter and keep tapping until you reach the target. Completing a charge earns 10 points. A new charge target is set for the next round. Play 5, 10, or 15 rounds. Tips: Charge distances vary each round from 3 to 8 taps. Maintain a consistent tapping rhythm rather than frantically mashing. Count your taps carefully to finish each charge at exactly the right moment.`,
  settings:knightChargeSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,component:KnightCharge,
};

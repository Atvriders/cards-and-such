import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RingTossProState, RingTossProAction, RingTossProSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RingTossPro } from "./Game.js";
const settings = { rings: { kind:"enum" as const, label:"Rings", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ringTossProPlugin: GamePlugin<RingTossProState, RingTossProAction, typeof settings> = {
  id:"ring-toss-pro", title:"Ring Toss Pro", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Classic carnival ring toss! Aim for the center peg for 500 points. But watch out for jitter!",
  howToPlay:`Ring Toss Pro is a digital carnival ring toss game. Nine pegs are arranged on the board with different point values: the center peg is worth 500 points, the four inner corner pegs are worth 200, and the four outer edge pegs are worth 100.

Click near a peg to toss a ring at it. The ring lands close to where you click, but there is a slight random jitter — simulating the real-world imprecision of tossing a ring. Each ring must land within the scoring radius of a peg to count.

Rings that miss all pegs score nothing. With 10 rings and perfect accuracy, the maximum possible score is 5000 (all center pegs). But the jitter makes this challenging!

Use Settings to choose 5 or 10 rings. Strategy: aim directly at the center peg for the jackpot, or target the reliable 200-point corner pegs if you want more consistent scoring. Can you master the jitter and ring every peg?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RingTossProSettings),
  reducer, isTerminal, component:RingTossPro,
};

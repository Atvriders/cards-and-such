import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MochaMarchState, MochaMarchAction, MochaMarchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MochaMarchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mochaMarchPlugin: GamePlugin<MochaMarchState, MochaMarchAction, typeof settings> = {
  id:"mocha-march", title:"Mocha March", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click marching mocha mugs. 30s clicker.",
  howToPlay:"Mocha March is a 30-second mocha-mug clicker. Mocha mugs march across six lanes; tap each one for 10 points before they march off the screen. Mugs only stay visible for a few ticks, so hit them quickly!\n\nEach tick spawns 1–2 new mocha mugs in random lanes (about once per second). It is pure reaction-time arcade — no strategy, no upgrades, no power-ups. Just clicking. Average scores land in the 200–300 range, with sharpshooters reaching 400+ and the very best touching 500.\n\nThe countdown timer reads from 30 to 0 in the top right; when time runs out, your tally is final. Show those mocha mugs you mean business — tap, tap, tap, and brew up a top score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MochaMarchSettings),
  reducer,isTerminal,component:MochaMarchGame,
};

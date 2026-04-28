import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BejeweledBlitzState, BejeweledBlitzAction, BejeweledBlitzSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BejeweledBlitzGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bejeweledBlitzPlugin: GamePlugin<BejeweledBlitzState, BejeweledBlitzAction, typeof settings> = {
  id:"bejeweled-blitz", title:"Bejeweled Blitz", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"60-second time-attack match-3 with sparkling gems.",
  howToPlay:"Bejeweled Blitz is a 60-second match-3 sprint. The board is a six-by-six grid of colored gems. Click two adjacent gems to swap them; if the swap creates a row or column of three or more identical gems, those gems vanish and you score ten points each. New gems fall from above to refill the board, sometimes triggering chain cascades for bonus clears. The clock counts down in the top-right corner. Only valid swaps that create matches will go through; invalid swaps cancel automatically. Plan your moves carefully — a four-in-a-row clear is double the points of a three, and well-placed swaps can unleash spectacular cascading combos. Sharpshooters routinely score 400+ points by chaining matches efficiently. Watch the timer, scan for triple opportunities, and tap fast. When time runs out, your final score is locked in. Sparkle on!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BejeweledBlitzSettings),
  reducer,isTerminal,component:BejeweledBlitzGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleTownMiniState, TripleTownMiniAction, TripleTownMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleTownMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleTownMiniPlugin: GamePlugin<TripleTownMiniState, TripleTownMiniAction, typeof settings> = {
  id:"triple-town-mini", title:"Triple Town Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build-your-town themed match-3 with grass to crowns.",
  howToPlay:"Triple Town Mini is a sixty-second town-themed match-three. The six-by-six grid is filled with progression-themed tiles: grass, bushes, trees, houses, castles, and crowns — each step grander than the last. Click adjacent tiles to swap them. When a swap creates three or more matching tiles in a row or column, those tiles clear for ten points each, and new tiles fall in from above. Cascade chains are common and pay big bonuses. Invalid swaps cancel without using a turn. While the original Triple Town has a different upgrade mechanic, this match-three variant celebrates that town-building flavor with progression-themed visuals. The clock counts down sixty seconds at the top. Average runs net 300-380 points; cascade hunters chasing castle and crown clears top 500. When the timer expires, your final score locks. Build your town, one match at a time!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleTownMiniSettings),
  reducer,isTerminal,component:TripleTownMiniGame,
};

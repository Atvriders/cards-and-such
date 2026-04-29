import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NightBaseballState, NightBaseballAction, NightBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NightBaseballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nightBaseballPlugin: GamePlugin<NightBaseballState, NightBaseballAction, typeof settings> = {
  id:"night-baseball", title:"Night Baseball", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Night Baseball: variant of Baseball where cards arrive face down. Reveal seven cards and score the best five-card hand.",
  howToPlay:"Night Baseball is the after-dark variant of Baseball poker. Cards are dealt face down and players must turn them up one at a time, betting after each reveal. Threes and nines would be wild, and a four forces a match payment. This solo edition strips out the betting and unveiling drama — you simply receive the seven cards and the reducer scores the best five-card hand.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are nine independent rounds — same nine-inning structure as classic Baseball. Pretend each round is the last out of an evening game where the lights stay low and the wild cards are mythical. Press Next between rounds and chase the brightest cumulative score you can manage in your Night-Baseball session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NightBaseballSettings),
  reducer,isTerminal,component:NightBaseballGame,
};

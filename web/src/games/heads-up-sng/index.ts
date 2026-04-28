import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeadsUpSngState, HeadsUpSngAction, HeadsUpSngSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HeadsUpSngGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const headsUpSngPlugin: GamePlugin<HeadsUpSngState, HeadsUpSngAction, typeof settings> = {
  id:"heads-up-sng", title:"Heads-Up SnG Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Heads-Up Sit & Go: rapid seven-card deal per round, best five-card hand scored.",
  howToPlay:"Heads-Up SnG Solo is a fast solo deal simulating the heads-up Sit & Go format. In live Heads-Up SnG, two players battle until one busts — short, brutal, position-dependent. Here, press Deal each round to receive seven cards and the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nOnly four rounds — a tight, high-pressure session. Live Heads-Up SnGs are over in 30-60 minutes; the abbreviated round count here mirrors that brevity.\n\nPress Next between rounds and try multiple seeds to test your variance.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HeadsUpSngSettings),
  reducer,isTerminal,component:HeadsUpSngGame,
};

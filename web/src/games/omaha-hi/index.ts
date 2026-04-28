import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaHiState, OmahaHiAction, OmahaHiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmahaHiGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const omahaHiPlugin: GamePlugin<OmahaHiState, OmahaHiAction, typeof settings> = {
  id:"omaha-hi", title:"Omaha Hi Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Omaha Hi: deal four hole cards plus five community, pick best five-card poker hand.",
  howToPlay:"Omaha Hi Solo simulates the four-hole-card Omaha Hi deal. Press Deal each round to receive nine random cards (four hole + five community) from a 52-card deck. The best five-card poker hand is scored automatically.\n\nIn real Omaha Hi you must use exactly two of your four hole cards plus exactly three community cards. This solo version simplifies that constraint by simply picking the best five-card hand from all nine — but you'll still see plenty of strong combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nSeven rounds. Because nine cards offer way more combinations than seven, expect Full Houses to be commonplace and Quads to appear regularly. Press Next between rounds and chase a Straight Flush for a session-defining score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmahaHiSettings),
  reducer,isTerminal,component:OmahaHiGame,
};

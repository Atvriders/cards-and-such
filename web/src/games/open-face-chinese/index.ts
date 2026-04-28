import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OpenFaceChineseState, OpenFaceChineseAction, OpenFaceChineseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OpenFaceChineseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const openFaceChinesePlugin: GamePlugin<OpenFaceChineseState, OpenFaceChineseAction, typeof settings> = {
  id:"open-face-chinese", title:"Open-Face Chinese Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo OFC: 13 cards dealt, scored as the strongest five-card sub-hand.",
  howToPlay:"Open-Face Chinese Poker (OFC) Solo simulates the popular 13-card poker game. In live OFC, players place 13 cards face-up across three rows: top (3 cards), middle (5), bottom (5). The hand must be valid (bottom strongest, then middle, then top).\n\nPress Deal each round to receive all 13 cards from a 52-card deck. This solo simplifies scoring: the best five-card poker hand among your 13 cards is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nFour rounds. With 13 cards in play, Full Houses and Quads are extremely common — expect huge per-round scores. Press Next between rounds and try to lock in a Straight Flush at least once per session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OpenFaceChineseSettings),
  reducer,isTerminal,component:OpenFaceChineseGame,
};

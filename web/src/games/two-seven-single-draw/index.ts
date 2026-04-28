import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoSevenSingleDrawState, TwoSevenSingleDrawAction, TwoSevenSingleDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoSevenSingleDrawGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const twoSevenSingleDrawPlugin: GamePlugin<TwoSevenSingleDrawState, TwoSevenSingleDrawAction, typeof settings> = {
  id:"two-seven-single-draw", title:"2-7 Single Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo 2-7 Lowball Single Draw: low hand wins, scoring inverted.",
  howToPlay:"2-7 Single Draw (Lowball) Solo is the one-draw cousin of Triple Draw. Press Deal each round to receive five cards from a 52-card deck. As in live 2-7 Lowball, the best hand is the lowest — 2-3-4-5-7 unsuited, with aces playing high (and so being bad).\n\nScoring is inverted: pair-free hands earn the most. High Card 100, Pair 60, Two Pair 40, Three of a Kind 25, Straight 10, Flush 5, Full House 2, Four of a Kind 1, Straight Flush 0.\n\nThe Single Draw format in live play offers fewer chances to improve; the strategic premium is on starting hand selection. Here the seeded one-shot deal mirrors that fast-paced rhythm.\n\nEight rounds. The variance is real — one paired board can crater a round. Press Next between rounds and aim for as many high-card hands as possible to maximise your final score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwoSevenSingleDrawSettings),
  reducer,isTerminal,component:TwoSevenSingleDrawGame,
};

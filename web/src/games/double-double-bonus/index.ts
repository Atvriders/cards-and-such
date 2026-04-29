import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDoubleBonusState, DoubleDoubleBonusAction, DoubleDoubleBonusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDoubleBonusGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleDoubleBonusPlugin: GamePlugin<DoubleDoubleBonusState, DoubleDoubleBonusAction, typeof settings> = {
  id:"double-double-bonus", title:"Double Double Bonus Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Double Double Bonus: video poker variant with extra kicker premiums on quads. Deal five cards and score the best hand.",
  howToPlay:"Double Double Bonus Poker is a video-poker paytable that piles extra premium on top of four-of-a-kind hands when accompanied by specific kickers — four aces with a 2/3/4 kicker, for example, pays an enormous bonus. This solo trainer skips the kicker math and uses the standard hand ranking so you can enjoy the deal-and-score loop.\n\nPress Deal each round to draw five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. In a real Double Double Bonus machine, the rare four-aces-plus-kicker hand can pay 800x the bet — a small fortune.\n\nThere are ten independent rounds. Press Next between rounds and try to chase those quads — every four-of-a-kind here is the moral equivalent of hitting the kicker bonus. Stack up your highest cumulative session score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoubleDoubleBonusSettings),
  reducer,isTerminal,component:DoubleDoubleBonusGame,
};

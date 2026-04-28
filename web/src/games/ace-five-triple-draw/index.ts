import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AceFiveTripleDrawState, AceFiveTripleDrawAction, AceFiveTripleDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AceFiveTripleDrawGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aceFiveTripleDrawPlugin: GamePlugin<AceFiveTripleDrawState, AceFiveTripleDrawAction, typeof settings> = {
  id:"ace-five-triple-draw", title:"A-5 Triple Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Ace-to-Five Triple Draw lowball: low hand wins; ace plays low.",
  howToPlay:"A-5 Triple Draw (Lowball) Solo deals you a five-card lowball hand each round. Unlike 2-7, in Ace-to-Five lowball the ace plays LOW — making the best possible hand A-2-3-4-5 (the wheel).\n\nScoring is inverted: low hands earn the most. High Card 100, Pair 60, Two Pair 40, Three of a Kind 25, Straight 10, Flush 5, Full House 2, Four of a Kind 1, Straight Flush 0.\n\nIn real Ace-to-Five Triple Draw, three drawing rounds let you replace cards you don't want. This solo seeded version compresses that into a single show-the-best-five round per game round.\n\nEight rounds. Aces appearing in your hand are now huge wins — they don't pair up with face cards in the rank-low sense. Press Next between rounds and try multiple seeds to see how often the wheel appears.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AceFiveTripleDrawSettings),
  reducer,isTerminal,component:AceFiveTripleDrawGame,
};

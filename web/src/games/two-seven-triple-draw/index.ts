import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoSevenTripleDrawState, TwoSevenTripleDrawAction, TwoSevenTripleDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwoSevenTripleDrawGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const twoSevenTripleDrawPlugin: GamePlugin<TwoSevenTripleDrawState, TwoSevenTripleDrawAction, typeof settings> = {
  id:"two-seven-triple-draw", title:"2-7 Triple Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo 2-7 Lowball Triple Draw: lowest hand wins; aces high, no straights/flushes hurting.",
  howToPlay:"2-7 Triple Draw (Lowball) Solo flips poker on its head. Press Deal each round to receive five random cards. The goal in real 2-7 is the LOWEST hand — best is 2-3-4-5-7 unsuited, with aces always high.\n\nScoring is reversed from standard poker: low hands score the most. High Card (your hand has no pairs) scores 100, Pair scores 60, Two Pair 40, Three of a Kind 25, Straight 10 (bad in lowball), Flush 5, Full House 2, Four of a Kind 1, Straight Flush 0.\n\nIn the live game you draw three times, each time discarding cards you don't want. This solo version simulates the post-final-draw deal with seeded RNG.\n\nEight rounds total. The trick is recognising that any pair drops your score significantly — only no-pair hands earn full points. Press Next between rounds and chase the perfect 2-3-4-5-7!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwoSevenTripleDrawSettings),
  reducer,isTerminal,component:TwoSevenTripleDrawGame,
};

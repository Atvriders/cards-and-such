import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JacksOrBetterState, JacksOrBetterAction, JacksOrBetterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JacksOrBetterGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jacksOrBetterPlugin: GamePlugin<JacksOrBetterState, JacksOrBetterAction, typeof settings> = {
  id:"jacks-or-better", title:"Jacks or Better (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Jacks or Better video poker: deal five cards and score the best hand. A pair of jacks or better would normally pay.",
  howToPlay:"Jacks or Better is the foundational video-poker paytable: a pair of jacks (or better) is the minimum paying hand. This solo trainer hands you five cards from a fresh 52-card deck and scores them with the standard hand-rank table — easy to learn, hard to master.\n\nPress Deal each round to receive five random cards. The reducer evaluates the hand and reports a rank: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Note that any pair scores here — in a real Jacks-or-Better machine, a low pair pays nothing, but for solo training we credit every pair.\n\nThere are ten independent rounds. Press Next between rounds and try to pile up the strongest cumulative score you can. With only five cards, your hands lean toward pairs and the occasional two-pair, but a single straight or flush in the right round can leap your total ahead.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JacksOrBetterSettings),
  reducer,isTerminal,  hint: (state: JacksOrBetterState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-jacks-or-better-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-jacks-or-better-next"]', pulses: 3 };
    return null;
  },
  component:JacksOrBetterGame,
};

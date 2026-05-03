import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaseballPokerState, BaseballPokerAction, BaseballPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BaseballPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const baseballPokerPlugin: GamePlugin<BaseballPokerState, BaseballPokerAction, typeof settings> = {
  id:"baseball-poker", title:"Baseball Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Baseball poker: 7-Stud-style deal where threes and nines would be wild. Score the best five-card hand from seven cards.",
  howToPlay:"Baseball poker is a 7-Card Stud variant where threes and nines are wild and being dealt a four costs you an extra ante. The name and three-strikes/nine-innings theme are pure Americana. This solo version skips the wilds and antes and focuses on the seven-card deal so you can pile up runs round after round.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and returns the strongest hand: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are nine independent rounds — one for each baseball inning. Imagine your threes and nines as bonus pitches you could have used to swing a game; here every card stays at face value. Press Next between rounds and stack up the highest nine-inning cumulative score for an MVP-worthy session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BaseballPokerSettings),
  reducer,isTerminal,  hint: (state: BaseballPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-baseball-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-baseball-poker-next"]', pulses: 3 };
    return null;
  },
  component:BaseballPokerGame,
};

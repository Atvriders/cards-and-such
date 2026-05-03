import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BigOPloState, BigOPloAction, BigOPloSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BigOPloGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bigOPloPlugin: GamePlugin<BigOPloState, BigOPloAction, typeof settings> = {
  id:"big-o-plo", title:"Big O (5-Card PLO Hi-Lo)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Big O: 5-card Pot-Limit Omaha Hi-Lo simulation. Deal seven cards and score the best five-card hand.",
  howToPlay:"Big O is the nickname for 5-card Pot-Limit Omaha Hi-Lo — a high-action mixed-pot variant played with five hole cards. Players must use exactly two of their hole cards and three from the board, with the pot split between best high and qualifying low. This solo trainer skips the split-pot logic and focuses on the high hand: deal seven cards (a sample of hole + board) and score the best five.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Five hole cards plus a board produces enormous combination counts in the real game — here the seven-card pool simulates the gist with frequent strong hands. Press Next between rounds and chase the strongest cumulative score across your full Big O session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BigOPloSettings),
  reducer,isTerminal,component:BigOPloGame,
  hint: (state: BigOPloState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-big-o-plo-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-big-o-plo-next"]', pulses: 3 };
    return null;
  },
};

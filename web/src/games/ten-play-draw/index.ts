import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TenPlayDrawState, TenPlayDrawAction, TenPlayDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TenPlayDrawGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tenPlayDrawPlugin: GamePlugin<TenPlayDrawState, TenPlayDrawAction, typeof settings> = {
  id:"ten-play-draw", title:"Ten Play Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo ten-play video poker; ten simultaneous hands per draw.",
  howToPlay:"Ten Play Draw Poker Solo simulates the high-variance VP format where ten simultaneous draw hands deploy from the same initial five-card deal. Press Deal to receive five cards; the engine scores ten independent draws.\n\nEach draw scored Jacks-or-Better: Pair (jacks+) 5, Two Pair 10, Three of a Kind 15, Straight 20, Flush 30, Full House 45, Four of a Kind 125, Straight Flush 250, Royal Flush 800. Ten lines per round, eight rounds total.\n\nTen Play is the maximum-variance multi-line VP format: a single dealt royal flush from the initial cards holds for all ten lines (jackpot times ten). Bankrolls swing wildly. Here each round multiplies by ten draws. Press Next to chase Ten Play jackpots and tower over the leaderboard!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TenPlayDrawSettings),
  reducer, isTerminal,   hint: (state: TenPlayDrawState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-ten-play-draw-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-ten-play-draw-next"]', pulses: 3 };
    return null;
  },
  component:TenPlayDrawGame,
};

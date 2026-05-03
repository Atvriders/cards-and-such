import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeepStackCashState, DeepStackCashAction, DeepStackCashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeepStackCashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const deepStackCashPlugin: GamePlugin<DeepStackCashState, DeepStackCashAction, typeof settings> = {
  id:"deep-stack-cash", title:"Deep Stack Cash Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo deep-stack poker; ten rounds simulating 200bb+ play.",
  howToPlay:"Deep Stack Cash Solo simulates classic deep cash games with starting stacks of 200 big blinds or more. Press Deal each round to receive seven cards (two hole + five community) and the engine picks the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Ten rounds reflect leisurely deep-stack play.\n\nDeep-stack play rewards skill over variance: implied odds rise dramatically and small pairs can stack big hands. Set-mining at 200bb+ is a viable winning strategy. Here, ten leisurely rounds give your score plenty of room to build slowly. Press Next to take the deep, methodical path to a top total!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DeepStackCashSettings),
  reducer,isTerminal,  hint: (state: DeepStackCashState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-deep-stack-cash-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-deep-stack-cash-next"]', pulses: 3 };
    return null;
  },
  component:DeepStackCashGame,
};

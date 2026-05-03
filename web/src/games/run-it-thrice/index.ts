import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RunItThriceState, RunItThriceAction, RunItThriceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RunItThriceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const runItThricePlugin: GamePlugin<RunItThriceState, RunItThriceAction, typeof settings> = {
  id:"run-it-thrice", title:"Run It Three Times Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo run-it-three-times poker; three-board simulation per round.",
  howToPlay:"Run It Three Times Solo simulates the rare cash-game variance reducer where all-in equity is run across three separate boards. Press Deal each round to receive seven cards and the engine evaluates the best five-card hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds reflect triple-run averaging.\n\nRunning it three times collapses variance even further than running it twice: with three boards, the actual distribution of outcomes is much closer to true equity. Pros use it to keep big sessions sane. Here each deal simulates the smoothed three-board variance. Press Next to grind eight low-variance rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RunItThriceSettings),
  reducer, isTerminal,   hint: (state: RunItThriceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-run-it-thrice-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-run-it-thrice-next"]', pulses: 3 };
    return null;
  },
  component:RunItThriceGame,
};

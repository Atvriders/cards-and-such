import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyState, DiceFrenzyAction, DiceFrenzySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFrenzyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFrenzyPlugin: GamePlugin<DiceFrenzyState, DiceFrenzyAction, typeof settings> = {
  id:"dice-frenzy", title:"Dice Frenzy", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 6 dice each round; +5 points per matching pair. 12 rounds.",
  howToPlay:`Dice Frenzy is a quick pair-counting dice mini. Each round, you roll 6 six-sided dice together. After the roll, the game counts how many matching pairs were rolled — for each face value (1 through 6), it takes floor(count / 2). Each pair scores 5 points.

For example, three 4s contains 1 pair (1 leftover); four 2s contains 2 pairs; six matching dice would be 3 pairs (15 points). It's possible to score multiple pairs across different faces in the same roll — for instance, two 1s and two 6s is 2 pairs (10 points).

There are 12 rounds total. Per the math, the average number of pairs in a roll of 6 dice is roughly 1.5, giving an expected score of about 7-8 points per round and 90+ for the whole game. Lucky rolls with three pairs (15 points) are about 4-5% per round.

Press Roll to throw the dice, then Next to advance.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFrenzySettings),
  reducer,
  isTerminal,
  hint: (state: DiceFrenzyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-frenzy-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-frenzy-next"]', pulses: 3 };
    return null;
  },
  component:DiceFrenzyGame,
};

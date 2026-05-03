import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Total7OrNotState, Total7OrNotAction, Total7OrNotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Total7OrNot } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const total7OrNotPlugin: GamePlugin<Total7OrNotState, Total7OrNotAction, typeof settings> = {
  id:"total-7-or-not", title:"Total 7 or Not", category:"dice",
  players:{min:1,max:1,multiplayer:false},
  description:"Roll 2 dice — will they total exactly 7? Bet on it for big points, or play it safe!",
  howToPlay:`Total 7 or Not is a dice prediction game based on probability. Each round two dice will be rolled. You predict: will their total be exactly 7, or some other number?

The key insight: 7 is the most likely single total with 2 dice. There are 6 ways to make 7 out of 36 possible outcomes (1/6 chance). That is higher than any other total. But it still only happens about 16% of the time — meaning "Not 7" wins most rounds.

The scoring reflects this: correctly guessing "Seven" earns 200 points (high risk, high reward). Correctly guessing "Not Seven" earns only 50 points (lower risk, lower reward). If you guess wrong you earn nothing.

The optimal strategy is never obvious. Take a pure "Not Seven" approach for steady 50-point gains, or gamble on sevens for the big scores. Use Settings to play 10 or 20 rounds. Can you outsmart the dice?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Total7OrNotSettings),
  reducer, isTerminal, component:Total7OrNot,
  hint: (state: Total7OrNotState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "guessing") return { selector: '[data-testid="hint-target-total7-guess"]', pulses: 3 };
    if (state.phase === "reveal") return { selector: '[data-testid="hint-target-total7-next"]', pulses: 3 };
    return null;
  },
};

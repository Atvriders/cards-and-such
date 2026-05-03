import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBlockadeState, DiceBlockadeAction, DiceBlockadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBlockadeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBlockadeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBlockadePlugin: GamePlugin<DiceBlockadeState, DiceBlockadeAction, typeof settings> = {
  id:"dice-blockade", title:"Dice Blockade", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Block opponent's progression: 10 rounds of head-to-head.",
  howToPlay:"Dice Blockade is a 10-round head-to-head dice duel. Each round, one die is rolled for you and one for the opponent. If your die is higher, you block their advance and score 15 points. If you tie, it is a partial block worth 5 points. If theirs is higher, you score nothing.\n\nPress Block to roll both dice. Press Next to advance.\n\nProbabilities: with two evenly random d6s, you win about 41.7 percent of the time (15 of 36 outcomes), tie 16.7 percent (6 of 36), and lose 41.7 percent (15 of 36). Expected per round is 0.417 times 15 plus 0.167 times 5 equals 7.1 points. Across 10 rounds, average score is about 71 points; lucky runs push toward 100-120 with multiple back-to-back wins.\n\nMaximum possible is 150 (10 wins of 15). Average score scoots in around 70. Dice Blockade is pure dice-luck combat: no choices, just the satisfaction of seeing your number top theirs. Hold the line!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBlockadeSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBlockadeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-blockade-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-blockade-next"]', pulses: 3 };
    return null;
  },
  component:DiceBlockadeGame,
};

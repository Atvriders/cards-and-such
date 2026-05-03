import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStairState, DiceStairAction, DiceStairSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceStairGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceStairGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStairPlugin: GamePlugin<DiceStairState, DiceStairAction, typeof settings> = {
  id:"dice-stair", title:"Dice Stair", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice — score 100 for a 1-2-3-4-5 stair, 50 for 4 in a row. 6 rounds.",
  howToPlay:"Dice Stair is a Yahtzee-style straight-hunting minigame. Each of the 6 rounds you roll five six-sided dice once and score based on the highest \"stair\" you achieve in any subset of the dice.\n\nA small stair (four consecutive faces — 1-2-3-4, 2-3-4-5, or 3-4-5-6) is worth 50 points. A perfect 1-2-3-4-5 stair is worth 100 points. The presence of a 6 alone is fine — what matters is the longest consecutive run buried in your roll. Anything less than four-in-a-row scores zero.\n\nPress Roll to throw all five dice. Your dice are sorted on screen and the stair length is computed automatically. Press Next to move on to the next round.\n\nThe probability of getting at least a four-stair on any roll is roughly 32%, so expect 1-3 small stairs per game and the occasional big 100-point hit. Build the staircase!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStairSettings),
  reducer,
  isTerminal,
  hint: (state: DiceStairState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-stair-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-stair-next"]', pulses: 3 };
    return null;
  },
  component:DiceStairGame,
};

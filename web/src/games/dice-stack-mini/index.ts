import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStackMiniState, DiceStackMiniAction, DiceStackMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceStackMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceStackMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStackMiniPlugin: GamePlugin<DiceStackMiniState, DiceStackMiniAction, typeof settings> = {
  id:"dice-stack-mini", title:"Dice Stack Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stack dice rolls in non-decreasing order. Break the chain and reset.",
  howToPlay:`Dice Stack Mini is a simple ascending dice game. You roll one six-sided die per round; if the new value is greater than or equal to the previous die in the stack, you score 20 + the die value (so a successful 6 scores 26 points, while a successful 1 scores 21).

If the new die is lower than the previous one, your stack breaks: you score zero for that round, and the stack resets to empty. The next round starts fresh with no constraint, so you can rebuild from any value.

You play 10 rounds. The probability of stacking on any roll varies with the last die — easy after a 1 (always succeeds), harder after a 6 (only succeeds on another 6). Average runs land near 100 points; really lucky runs of consecutive 5s and 6s can push past 200. Press Roll, watch the stack, and chase the streak!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStackMiniSettings),
  reducer,
  isTerminal,
  hint: (state: DiceStackMiniState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-stack-mini-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-stack-mini-next"]', pulses: 3 };
    return null;
  },
  component:DiceStackMiniGame,
};

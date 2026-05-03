import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRollCallState, DiceRollCallAction, DiceRollCallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceRollCallGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceRollCallGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRollCallPlugin: GamePlugin<DiceRollCallState, DiceRollCallAction, typeof settings> = {
  id:"dice-roll-call", title:"Dice Roll Call", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Call the value before each die roll — exact hits and near misses both score.",
  howToPlay:`Dice Roll Call is a 10-round prediction game. Before each die rolls, you "call" the value you think it will land on by tapping one of the six dice buttons. The die then rolls, and you find out how close you were.

Scoring per round:
- Exact call (your guess matched the roll): 30 points
- Off by one (within 1 of the roll): 8 points
- Off by two or more: 0 points

Maximum theoretical score is 300 (10 perfect calls). The expected value of one round is ~7 points (1/6 chance of 30 + 2/6 chance of 8 ≈ 7.7), so an average run lands around 70–80.

The game is pure probability — you have no information about which face the die will land on — but the call-then-reveal rhythm gives every round a moment of suspense. Some players develop superstitious "lucky calls" (always call 3); others vary every round.

Tap a number 1–6 to call, then click Next after seeing the result. Sharpen your six-sided sixth sense!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRollCallSettings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-roll-call-roll"]', pulses: 3 }; },
  component: DiceRollCallGame,
};

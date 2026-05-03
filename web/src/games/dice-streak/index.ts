import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStreakState, DiceStreakAction, DiceStreakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceStreakGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceStreakGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceStreakPlugin: GamePlugin<DiceStreakState, DiceStreakAction, typeof settings> = {
  id:"dice-streak", title:"Dice Streak", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll one die at a time. Streaks of 3+ same face score 10× streak when broken.",
  howToPlay:`Dice Streak is a streak-chasing single-die game. Each roll produces a face from 1 to 6. Whenever you roll the same face as the previous roll, your current streak grows by one. Roll a different face, and if your prior streak was 3 or longer, you bank a bonus equal to streak length × 10 points.

You have up to 30 rolls per session. You can also press Stop & Score at any time to lock in your current streak (if 3+) and end the run early. Streaks of 3, 4, 5, or even 6+ are rare but immensely satisfying — a streak of 5 banks 50 points all at once.

Maximum theoretical score is unbounded but rarely tops 100 points. The probability of a streak of 4 is 1/216, of 5 is 1/1296. Realistic averages cluster around 30-50 points. The fun is the building tension as a streak runs deeper and deeper.

Roll, watch, and pray for that beautiful chain of repeats!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStreakSettings),
  reducer,isTerminal,
  hint: (state: DiceStreakState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.streak >= 3) return { selector: '[data-testid="hint-target-dice-streak-stop"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-streak-roll"]', pulses: 3 };
  },
  component:DiceStreakGame,
};

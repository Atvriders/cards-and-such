import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EvensOrOddsDiceState, EvensOrOddsDiceAction, EvensOrOddsDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EvensOrOddsDice = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EvensOrOddsDice as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const evensOrOddsDicePlugin: GamePlugin<EvensOrOddsDiceState, EvensOrOddsDiceAction, typeof settings> = {
  id:"evens-or-odds-dice", title:"Evens or Odds Dice", category:"dice",
  players:{min:1,max:1,multiplayer:false},
  description:"Predict whether 3 dice will total an even or odd number. Build streaks for bonus points!",
  howToPlay:`Evens or Odds Dice is a quick prediction game. Each round three dice are hidden. You must predict whether their total will be even or odd before the dice are rolled and revealed.

Press Even or Odd to make your prediction. The dice are then rolled and their total shown. If you predicted correctly, you earn 50 base points. Keeping a streak of correct answers earns 10 extra points per consecutive correct guess — so a 5-streak gives 100 pts per correct answer!

The math: with 3 dice, the total ranges from 3 to 18. Odd totals (3-17 odd numbers) and even totals (4-18 even numbers) are approximately equally likely. The probability of odd is exactly 50%, so this is a true 50/50 game — but streaks can make a big difference to your final score.

Use Settings to play 10 or 20 rounds. Try to build long streaks for maximum points. Simple, fast, and satisfying!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EvensOrOddsDiceSettings),
  reducer, isTerminal, component:EvensOrOddsDice,
  hint: (state: EvensOrOddsDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "guessing") return { selector: '[data-testid="hint-target-eood-even"]', pulses: 3 };
    if (state.phase === "reveal") return { selector: '[data-testid="hint-target-eood-next"]', pulses: 3 };
    return null;
  },
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCheckersState, DiceCheckersAction, DiceCheckersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCheckersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCheckersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCheckersPlugin: GamePlugin<DiceCheckersState, DiceCheckersAction, typeof settings> = {
  id:"dice-checkers", title:"Dice Checkers", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll for 10 capture turns. 5+ captures, 1-4 just moves.",
  howToPlay:`Dice Checkers is a 10-turn dice-driven capture game. Each turn, press Roll to throw a single six-sided die. The result determines what your "checker" does:

— Roll 5 or 6: Capture! Worth 30 points.
— Roll 1, 2, 3, or 4: Just a regular move, worth 5 points.

So every turn scores something — there are no zero turns. The capture rate is 1/3, so on average you'll get about 3-4 captures across 10 turns. Average final scores fall around 110-130 points. A streak of all captures hits 300 points; an unlucky game with zero captures still hits 50.

Press Roll to throw the die, then press Next to continue. There's no skill beyond enjoying random outcomes — but the difference between a hot dice game and a cold one is dramatic. Beat your personal best!

10 turns total. Maximum 300 points. Lock in those high rolls!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCheckersSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCheckersState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-checkers-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-checkers-next"]', pulses: 3 };
    return null;
  },
  component:DiceCheckersGame,
};

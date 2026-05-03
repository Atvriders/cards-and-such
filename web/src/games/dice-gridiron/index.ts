import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGridironState, DiceGridironAction, DiceGridironSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceGridironGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceGridironGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceGridironPlugin: GamePlugin<DiceGridironState, DiceGridironAction, typeof settings> = {
  id:"dice-gridiron", title:"Dice Gridiron", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dice football; yards by roll; 12 rounds.",
  howToPlay:"Dice Gridiron is a dice football mini. Across 12 rounds, you roll two dice and gain \"yards\" equal to twice the sum (so 2-12 dice maps to 4-24 yards per play). Total all yards across the 12 rounds.\n\nExpected value per roll is 14 yards; expected season total is 168 yards. Great runs push 200+; cold runs may stall at 130. The cap is 24 × 12 = 288 yards (all 12s — a true Hall of Fame season).\n\nPress Roll for each play, then Next to advance to the next down. Simple, rhythmic, and infused with the satisfaction of moving the chains. Real football has downs, conversions, and tactical play-calling; this mini distills the joy of yardage into pure RNG flow. Get those yards!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceGridironSettings),
  reducer,
  isTerminal,
  hint: (state: DiceGridironState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-gridiron-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-gridiron-next"]', pulses: 3 };
    return null;
  },
  component:DiceGridironGame,
};

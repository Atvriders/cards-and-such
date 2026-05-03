import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTyphoonState, DiceTyphoonAction, DiceTyphoonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTyphoonGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTyphoonGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTyphoonPlugin: GamePlugin<DiceTyphoonState, DiceTyphoonAction, typeof settings> = {
  id:"dice-typhoon", title:"Dice Typhoon", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Typhoon dice — even sums get storm bonus. 10 rounds.",
  howToPlay:"Dice Typhoon channels the chaos of a storm into the dice. Each round, you roll two six-sided dice. Even sums (2, 4, 6, 8, 10, 12) survive the typhoon and earn a 10-point storm bonus on top of the sum. Odd sums (3, 5, 7, 9, 11) just score the sum itself.\n\nSo an even sum of 2 = 12, an even 6 = 16, an even 12 = 22. An odd 3 = 3, an odd 11 = 11.\n\nProbabilities: even sums occur exactly 18/36 = 50% of the time. The most common even sum is 6 or 8 (each 14% of all rolls), the rarest are 2 and 12 (each 2.8%). Average even sum is about 7, average odd sum is also 7. So expected per-round score is roughly (50% × 17) + (50% × 7) = 12.\n\nYou play 10 rounds — expected total around 110-130. With luck (extra evens, especially 8s and 10s), you can push 160+.\n\nA simple even-vs-odd dice game with a stormy theme.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTyphoonSettings),
  reducer,isTerminal,
  hint: (state: DiceTyphoonState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.pool > 0) return { selector: '[data-testid="hint-target-dice-typhoon-bank"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-typhoon-roll"]', pulses: 3 };
  },
  component:DiceTyphoonGame,
};

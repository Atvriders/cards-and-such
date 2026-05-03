import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollAndWriteState, RollAndWriteAction, RollAndWriteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RollAndWriteGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RollAndWriteGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rollAndWritePlugin: GamePlugin<RollAndWriteState, RollAndWriteAction, typeof settings> = {
  id:"roll-and-write", title:"Roll and Write", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Six rounds of four dice. Place each roll into one of four scoring categories.",
  howToPlay:`Roll and Write is a tactical dice puzzle inspired by Yahtzee-style score sheets. Each round, you roll four six-sided dice, then choose one of four scoring categories to place the result:

- Small (1-3): sum of all dice showing 1, 2, or 3.
- Big (4-6): sum of all dice showing 4, 5, or 6.
- Evens: sum of all even dice (2, 4, 6).
- Odds: sum of all odd dice (1, 3, 5).

Each category may be used AT MOST ONCE in the entire game, but you have 6 rounds. So 2 of your 6 rounds will be wasted (scoring zero), but you decide which! That's the strategy: when do you cut your losses and burn a category on a low roll?

Each button shows that category's potential score for the current roll, so you can compare options at a glance. Pick the best one — or save it for later.

Maximum score is 24 per category x 4 = 96, but realistic top scores are around 50-60. Plan ahead!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RollAndWriteSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-roll-and-write-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-roll-and-write-choose"]', pulses: 3 };
  },
  component:RollAndWriteGame,
};

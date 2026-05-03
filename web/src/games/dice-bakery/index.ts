import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBakeryState, DiceBakeryAction, DiceBakerySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBakeryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBakeryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBakeryPlugin: GamePlugin<DiceBakeryState, DiceBakeryAction, typeof settings> = {
  id:"dice-bakery", title:"Dice Bakery", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bake bread by rolling four dice. Even faces are perfect rises; 10 rounds.",
  howToPlay:"Dice Bakery is a 10-round dice mini themed around a small village bakery. Each round, roll four dice representing the rise of four loaves in the oven. Each die shows a face — even faces (2, 4, 6) are perfect rises and score 5 points each. Odd faces (1, 3, 5) are flat loaves and score nothing.\\n\\nPress Bake to roll the four dice and see how the loaves came out, then press Next to start the next batch. There's no choice or skill — fortune controls the oven.\\n\\nWith 50% probability per die of rolling even, you'll average 2 good loaves per batch (10 points), or 100 points over 10 rounds. Lucky bakers can hit 150+; unlucky ones sometimes scrape under 60. A simple, cozy game perfect with a cup of tea. Bake it warm and serve it fresh!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBakerySettings),
  reducer,
  isTerminal,
  hint: (state: DiceBakeryState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-dice-bakery-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-bakery-next"]', pulses: 3 };
    return null;
  },
  component:DiceBakeryGame,
};

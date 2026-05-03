import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBowlingState, DiceBowlingAction, DiceBowlingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBowlingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBowlingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBowlingPlugin: GamePlugin<DiceBowlingState, DiceBowlingAction, typeof settings> = {
  id:"dice-bowling", title:"Dice Bowling", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two dice = pins knocked down; 10 frames.",
  howToPlay:"Dice Bowling is a 10-frame bowling mini using dice. Each round (frame) you roll two six-sided dice; the sum (2-12) represents pins knocked down for that frame. Total your scores across 10 frames.\n\nExpected value per frame is 7 pins; average final score across 10 frames is 70. Strong runs can hit 90+; cold runs land near 50. The maximum possible score (all 12s) is 120 — a perfect game by mini standards.\n\nPress Roll to bowl, then Next to advance. Quick, rhythmic, and tinted with the satisfaction of bowling-strike alleys. Real bowling has spares and strikes that compound; this mini keeps the rules simple — just roll, score, and roll again. A perfect 1-minute bowling fix without leaving your couch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBowlingSettings),
  reducer,isTerminal,
  hint: (state: DiceBowlingState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "rolling") {
      return { selector: '[data-testid="hint-target-dice-bowling-roll"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-dice-bowling-next"]', pulses: 3 };
  },
  component:DiceBowlingGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDerbyState, DiceDerbyAction, DiceDerbySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceDerbyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceDerbyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDerbyPlugin: GamePlugin<DiceDerbyState, DiceDerbyAction, typeof settings> = {
  id:"dice-derby", title:"Dice Derby", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Race to 3 sixes by rolling 6 dice up to 12 times. 5 races for points.",
  howToPlay:`Dice Derby is a luck-based dice race. In each race, you roll six standard six-sided dice up to 12 times, accumulating sixes across the rolls. Your goal is to reach 3 total sixes before your 12 rolls run out. Successful races award 20 points; if you fail to hit 3 sixes in 12 rolls, you score zero for that race.

You play 5 races per game, with a maximum possible score of 100 points (5 races × 20 each).

Probability tip: each die has a 1/6 chance of rolling a six, so each roll of 6 dice produces an expected 1 six on average. Reaching 3 sixes within 12 rolls is highly likely — most races will succeed. The fun is the build-up: rolls without sixes feel painful, and rolls with two or three sixes at once feel triumphant.

Tap Roll, watch the highlighted sixes, and chase those three. Average expected scores tend to be 80-100 — you should win most races.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDerbySettings),
  reducer,
  isTerminal,
  hint: (state: DiceDerbyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "racing") return { selector: '[data-testid="hint-target-dice-derby-roll"]', pulses: 3 };
    if (state.phase === "raceDone") return { selector: '[data-testid="hint-target-dice-derby-next"]', pulses: 3 };
    return null;
  },
  component:DiceDerbyGame,
};

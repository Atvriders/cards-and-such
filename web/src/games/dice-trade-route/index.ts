import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTradeRouteState, DiceTradeRouteAction, DiceTradeRouteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceTradeRouteGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceTradeRouteGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTradeRoutePlugin: GamePlugin<DiceTradeRouteState, DiceTradeRouteAction, typeof settings> = {
  id:"dice-trade-route", title:"Dice Trade Route", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trade dice across cities. Sum 6-9 = success. 10 rounds.",
  howToPlay:"Dice Trade Route is a 10-round dice mini. You're a merchant carrying goods between cities; each round, you roll two dice to determine if your caravan crosses safely. A sum from 6 to 9 inclusive is the 'safe corridor' and earns you 10 points; sums below 6 (bandits!) or above 9 (mountain passes!) yield nothing.\n\nThe probability of sum in [6, 9] is 20/36, about 55.5%. So expected scores are around 55 points across 10 rounds — a relatively friendly mini.\n\nThere's no choice — just press Roll, see the sum, and watch your caravan's progress. After each result, press Next to continue. The trade-route flavor is cosmetic; mechanically it's a band-pass dice game with a generous win range. Calculate your profits at the end!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTradeRouteSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-dice-trade-route-primary"]', pulses: 3 }), component:DiceTradeRouteGame,
};

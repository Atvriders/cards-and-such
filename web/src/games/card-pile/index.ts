import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPileState, CardPileAction, CardPileSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPileGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPileGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPilePlugin: GamePlugin<CardPileState, CardPileAction, typeof settings> = {
  id:"card-pile", title:"Card Pile", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pile cards aiming for a target sum. 8 rounds; closer = higher score.",
  howToPlay:`Card Pile is a press-your-luck card-drawing game. Each round you receive a target sum between 15 and 25. Press Draw to add cards to the pile; rank values are 2 through 10 face value, J=11, Q=12, K=13, and A=1. Your goal is to land your pile's running total as close to the target as you can without overshooting by too much.

Press Stop when you're satisfied to lock in your sum. Your score for the round is 30 minus three times the absolute difference from the target, with a minimum of zero. Land exactly on target for a maximum 30 points; miss by 5 for 15 points; miss by 10 or more for nothing. If you go too high (target+10 or more), you bust and score zero automatically.

There are 8 rounds, max 240 points. The challenge is balancing risk: drawing more cards refines your aim but flirts with the bust line. Average runs hit around 110-150.

Build your pile carefully and find the sweet spot!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPileSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pile-primary"]', pulses: 3 }), component:CardPileGame,
};

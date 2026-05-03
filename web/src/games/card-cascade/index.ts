import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCascadeState, CardCascadeAction, CardCascadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCascadeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCascadeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCascadePlugin: GamePlugin<CardCascadeState, CardCascadeAction, typeof settings> = {
  id:"card-cascade", title:"Card Cascade", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Cards must descend in rank — each cascade extends the streak bonus.",
  howToPlay:"Card Cascade is a 12-draw card mini that rewards you for descending sequences. The first card you draw earns a small base of 5 points. Every subsequent card that's lower in rank than the one before it extends a cascade streak — each extension scores 10 points plus 5 per current streak length.\n\nThe longer you keep cards descending, the bigger each next score. A perfect cascade of 12 cards is theoretically possible (Ace down to 2) but rare. Realistic high scores sit in the 100-300 range.\n\nCards that don't continue the descent reset the streak to zero — they earn nothing and the cascade has to restart from the next card. Past cards appear in a small ribbon so you can see your descent path.\n\nThere's no choice — pure luck — but the streak bonus turns lucky descending runs into satisfying scoring waves. Aim for as long a cascade as you can!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCascadeSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-cascade-primary"]', pulses: 3 }), component:CardCascadeGame,
};

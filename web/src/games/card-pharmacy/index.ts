import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPharmacyState, CardPharmacyAction, CardPharmacySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPharmacyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPharmacyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPharmacyPlugin: GamePlugin<CardPharmacyState, CardPharmacyAction, typeof settings> = {
  id:"card-pharmacy", title:"Card Pharmacy", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pharmacy mini — collect royals/Aces for big points.",
  howToPlay:"Card Pharmacy turns the deck into a tiny apothecary. Twelve cards arrive two at a time. Each round you decide Take (fill the prescription) or Skip (back on the shelf). Your goal is to collect specific high ranks — Jacks, Queens, Kings, and Aces — to score the best.\n\nFinal scoring: 5 points per kept card, +25 each for J/Q/K and +50 for A. Low ranks score nothing extra. So a pharmacy basket of three Aces and a King is worth far more than ten random twos. Skip ruthlessly — you're stocking only quality medicine.\n\nSix rounds total (12 cards). The trick is recognizing when to take a non-face card to keep volume going vs. holding out for the big-ticket royal. The skilled pharmacist knows when to dispense and when to wait.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPharmacySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pharmacy-primary"]', pulses: 3 }), component:CardPharmacyGame,
};

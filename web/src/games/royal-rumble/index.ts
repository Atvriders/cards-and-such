import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoyalRumbleState, RoyalRumbleAction, RoyalRumbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RoyalRumbleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RoyalRumbleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const royalRumblePlugin: GamePlugin<RoyalRumbleState, RoyalRumbleAction, typeof settings> = {
  id:"royal-rumble", title:"Royal Rumble", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pull 5 cards each round. +50 per face card. 10 rounds.",
  howToPlay:`Royal Rumble is a face-card hunt with stakes. Each of 10 rounds, you pull five cards from a fresh deck and score 50 points for every Jack, Queen, or King in the spread. Numbers and Aces score nothing — this is strictly about royalty.

Twelve of the 52 cards are face cards (about 23%), so the average pull will yield roughly 1.15 face cards, or about 57 points per round. Across 10 rounds the typical haul lands near 575 points, but the variance is huge: rounds with zero faces are common, and a four- or five-face round will leave you grinning.

There's no decision-making in the round — just press Pull 5 and watch fate. Press Next to advance. Want to keep score? Aim for 700+, with 800–900 being a strong run, and 1000+ a dream finish where the royals showed up in force.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RoyalRumbleSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-royal-rumble-primary"]', pulses: 3 }),component:RoyalRumbleGame,
};

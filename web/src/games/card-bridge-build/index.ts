import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBridgeBuildState, CardBridgeBuildAction, CardBridgeBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardBridgeBuildGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardBridgeBuildGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBridgeBuildPlugin: GamePlugin<CardBridgeBuildState, CardBridgeBuildAction, typeof settings> = {
  id:"card-bridge-build", title:"Card Bridge Build", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a bridge — order matters across 8 rounds of card laying.",
  howToPlay:"Card Bridge Build is an 8-round construction mini where you lay 5 cards per round to build a bridge. The bridge holds together if your cards form a roughly ordered sequence — gaps and inversions weaken the structure.\n\nYour round score equals 60 points minus 4 points for each pair of adjacent cards that's out of ascending pip-value order. A perfectly sorted hand (in ascending pip value as drawn) scores the full 60. A perfectly reversed hand scores 60 - 4*4 = 44. Most random draws score around 36-48 points.\n\nPress Deal 5 to lay your bridge cards, then Next to start the next span. After 8 rounds your bridge is complete. Average runs land near 320-380 points. Expert lucky deals can push past 450. Press Finish on round 8 to see your final structural score. The more orderly your draw, the stronger the span.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBridgeBuildSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-bridge-build-primary"]', pulses: 3 }), component:CardBridgeBuildGame,
};

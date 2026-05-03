import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCastleBuildState, CardCastleBuildAction, CardCastleBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCastleBuildGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCastleBuildGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCastleBuildPlugin: GamePlugin<CardCastleBuildState, CardCastleBuildAction, typeof settings> = {
  id:"card-castle-build", title:"Card Castle Build", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a castle with face cards — 12 rounds, face cards are stones.",
  howToPlay:"Card Castle Build is a 12-round masonry mini where you stack face cards as stones for your castle. Aces, Jacks, Queens, and Kings all count as castle stones; numbered cards (2-10) are mere rubble that doesn't help.\n\nEach round you draw 5 cards. Your score equals 14 points per A/J/Q/K stone plus 2 points per numbered rubble card (so even bad hands give you something). A hand of 5 face cards is a perfect courtyard for 70 points; a hand of all numbers gives you 10 points minimum.\n\nPress Deal 5 to gather your stones, then Next to add a wing to the castle. After 12 rounds your fortress is built. With 16/52 cards being A/J/Q/K stones, you'll average about 1.5 stones per hand (~21 + 7 = ~28 points/round), giving typical runs near 320-400 points. Expert lucky castles push past 500. Build wisely, mason!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCastleBuildSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-castle-build-primary"]', pulses: 3 }), component:CardCastleBuildGame,
};

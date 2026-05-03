import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFountainState, CardFountainAction, CardFountainSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardFountainGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardFountainGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFountainPlugin: GamePlugin<CardFountainState, CardFountainAction, typeof settings> = {
  id:"card-fountain", title:"Card Fountain", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards spray from a magic fountain. Aces are rare gems; 12 draws.",
  howToPlay:"Card Fountain is a 12-draw card mini themed around a magical wishing fountain. Each round, the fountain sprays out a random card. Aces are rare gems and score a generous 30 points. Face cards (J, Q, K) are silver coins worth 15 points. Everything else (2-10) is just water spray worth 5 points.\\n\\nThere's no skill — the fountain does what it pleases. Press Draw to catch the next gem (or just water), then Next to wait for the next spray. With 12 draws and a 1/13 Ace probability, expect to catch about 1 Ace per game on average — more if the fountain favors you.\\n\\nAverage scores land near 110-140 points; lucky runs with multiple aces and faces can push 200+. A simple, sparkling little card mini perfect for a coffee break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFountainSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-fountain-primary"]', pulses: 3 }), component:CardFountainGame,
};

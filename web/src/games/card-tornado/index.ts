import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTornadoState, CardTornadoAction, CardTornadoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardTornadoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardTornadoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTornadoPlugin: GamePlugin<CardTornadoState, CardTornadoAction, typeof settings> = {
  id:"card-tornado", title:"Card Tornado", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards swirl in a tornado. Pick the best one each round to score. 12 rounds.",
  howToPlay:"Card Tornado spins five cards into the eye of a swirling storm each round. Your job is to pick the most valuable card based on rank and suit. Higher ranks score more (Ace=14, King=13, Queen=12, Jack=11, all the way down to 2), and any card matching the round's target suit earns a 10-point bonus.\n\nEach round shows you the cards face-up — there's no secret pile, no hidden hand. Look at the ranks, look at the target suit, and pick wisely. The math: the score for a card is (rank value × 2) plus 10 if its suit matches the target.\n\nYou play 12 rounds, and your scores accumulate. Average expected scores hover around 250-350 depending on whether you spot the target-suit bonuses. The very best players, who consistently grab high-rank target-suit cards, can push past 400.\n\nIt's a quick, no-stress card game perfect for a coffee break or a quiet evening with the deck.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTornadoSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-tornado-primary"]', pulses: 3 }), component:CardTornadoGame,
};

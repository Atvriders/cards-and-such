import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMuseumState, CardMuseumAction, CardMuseumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardMuseumGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardMuseumGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMuseumPlugin: GamePlugin<CardMuseumState, CardMuseumAction, typeof settings> = {
  id:"card-museum", title:"Card Museum", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Visit the museum — Spades (rare exhibits) score!",
  howToPlay:`Card Museum is a card collection game with a museum theme. Over 12 cards from a shuffled deck, only Spades — the rarest, most valuable exhibits — score points. Each Spade is worth 10. Hearts, Clubs, and Diamonds (less prestigious displays) score zero.

Press Draw Card to reveal each card. The score updates immediately. After 12 cards, your museum visit ends. With 13 Spades in a 52-card deck, you should expect about 3 Spades per game (12 × 13/52 = 3) — that's around 30 points on average. A rare-spades day can yield 50-70+; a sparse visit might leave you under 20.

There are no decisions to make. Just walk through the gallery and let the deck decide which exhibits you encounter. Every Spade is a treasure unearthed!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMuseumSettings),
  reducer,isTerminal, hint: (state: CardMuseumState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-card-museum-primary"]', pulses: 3 } : null),component:CardMuseumGame,
};

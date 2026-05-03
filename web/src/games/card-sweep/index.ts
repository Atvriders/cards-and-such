import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSweepState, CardSweepAction, CardSweepSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardSweepGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardSweepGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSweepPlugin: GamePlugin<CardSweepState, CardSweepAction, typeof settings> = {
  id:"card-sweep", title:"Card Sweep", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sweep cards by suit: clubs and diamonds score. 12 cards.",
  howToPlay:"Card Sweep is a 12-card mini. The board has four 'sweep zones' arranged in north, south, east, and west corners — but in this simplified version, you sweep by drawing 12 cards and scoring each clubs-suit or diamonds-suit card for 10 points.\n\nConcretely: clubs and diamonds are the 'sweep suits'; hearts and spades are not. Half the deck (26 cards) qualifies, so expected scores are 60 points across 12 rounds, with lucky runs reaching 100+.\n\nThere's no choice within a round — press Draw, see the card, score if it's a sweep suit, then advance. The 'Sweep' theme is mostly aesthetic: the cards represent debris and dust being cleared in different directions. The game is pure coin-flip luck. Quick to play, no thinking needed, perfect for a mindless score-chasing minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSweepSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-sweep-primary"]', pulses: 3 }), component:CardSweepGame,
};

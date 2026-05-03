import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFlagPoleState, CardFlagPoleAction, CardFlagPoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardFlagPoleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardFlagPoleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFlagPolePlugin: GamePlugin<CardFlagPoleState, CardFlagPoleAction, typeof settings> = {
  id:"card-flag-pole", title:"Card Flag Pole", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Climb the flag pole — high cards score top of the pole!",
  howToPlay:`Card Flag Pole is a simple draw-and-tally card game where you raise your card flag up the pole. Each draw is one of 12 cards. The higher the card's rank, the higher it climbs — Aces are king of the hill at 13 points each, while a humble 2 is just 1 point. Face cards (J, Q, K) score 10, 11, and 12 respectively.

Press Draw Card to reveal your next card from the shuffled deck. Each card's score is added to your running total. After 12 cards, the game ends and you see your final score. There are no choices — just sit back and let the deck decide.

The maximum possible score is 12 Aces × 13 = 156, but with only 4 of each rank in a deck, an average run lands around 75-90 points. Lucky draws of Aces and Kings push you toward the top of the leaderboard. Aim for the sky!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFlagPoleSettings),
  reducer,isTerminal, hint: (state: CardFlagPoleState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-card-flag-pole-primary"]', pulses: 3 } : null),component:CardFlagPoleGame,
};

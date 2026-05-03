import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPuzzleState, CardPuzzleAction, CardPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPuzzlePlugin: GamePlugin<CardPuzzleState, CardPuzzleAction, typeof settings> = {
  id:"card-puzzle", title:"Card Puzzle", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Mini card puzzle: red cards score. 8 rounds.",
  howToPlay:"Card Puzzle is a tiny single-card mini. You get 8 rounds. Each round, draw a card from the deck. Red cards (hearts and diamonds) successfully fit the puzzle slot and earn 10 points; black cards (spades and clubs) don't fit and earn nothing.\n\nThe probability of red is exactly 50% — 26 of 52 cards are red — so this is a pure coin flip with a friendlier interface. Across 8 rounds, expect about 40 points on average, with hot streaks reaching 60-70.\n\nThe mini name is intentionally puzzle-themed: think of each card as a piece that either slots in (red, fits the gap) or doesn't (black, wrong shape). There's no real choice within the round — just draw, look, advance. Quick, casual, no thinking required. Perfect for a one-minute distraction!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPuzzleSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-puzzle-primary"]', pulses: 3 }), component:CardPuzzleGame,
};

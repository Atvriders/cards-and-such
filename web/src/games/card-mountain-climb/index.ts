import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMountainClimbState, CardMountainClimbAction, CardMountainClimbSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardMountainClimbGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardMountainClimbGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardMountainClimbPlugin: GamePlugin<CardMountainClimbState, CardMountainClimbAction, typeof settings> = {
  id:"card-mountain-climb", title:"Card Mountain Climb", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Climb the mountain — higher cards score more!",
  howToPlay:`Card Mountain Climb is a simple card draw game with a mountaineering theme. Over 8 rounds, you draw a card each round. Higher-ranked cards score more points — A 2 is 1 point, while an Ace is 13. Face cards score 10-12. Your rank-based total represents how high up the mountain you've climbed.

Press Draw Card to reveal each card. The score updates immediately, and after 8 cards the game ends. There are no decisions — just card luck. The maximum possible score with 8 perfect Aces would be 104, but in practice average runs land around 50-60 points (the average rank value in a deck is about 7).

A great climb is one where Kings, Queens, and Aces dominate; a tough one is full of low pip cards. Either way, every card carries you a little higher — to the summit and a high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardMountainClimbSettings),
  reducer,isTerminal, hint: (state: CardMountainClimbState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-card-mountain-climb-primary"]', pulses: 3 } : null),component:CardMountainClimbGame,
};

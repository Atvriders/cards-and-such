import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPyramidBuildState, CardPyramidBuildAction, CardPyramidBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPyramidBuildGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPyramidBuildGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardPyramidBuildPlugin: GamePlugin<CardPyramidBuildState, CardPyramidBuildAction, typeof settings> = {
  id:"card-pyramid-build", title:"Card Pyramid Build", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a 10-card pyramid one card at a time. 50 base + 25 bonus for ascending row sums.",
  howToPlay:`Card Pyramid Build is a single-game pyramid construction puzzle. Your job: build a 10-card pyramid (1+2+3+4 cards) by placing cards from a shuffled deck into the next available slot, top to bottom. Place each card by tapping its highlighted slot; you score 5 points for every card placed (50 points base for completing the pyramid).

You can also Skip the next card to discard it, hoping for something better — useful when you want a strong base but the next card is a low pip. There's only one shuffled deck, and the game ends as soon as the 10th slot is filled.

Earn a 25-point bonus if your finished pyramid has its row totals trending upward, with the wider bottom rows summing higher than the apex — a satisfying "stable" pyramid. The pip values follow the standard scheme: 2-10 face value, J=11, Q=12, K=13, A=1.

Maximum score is 75. Average runs hit around 50-60. Build wisely and stack that bonus!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPyramidBuildSettings),
  reducer,isTerminal,
  hint: (state: CardPyramidBuildState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: '[data-testid="hint-target-card-pyramid-build-slot"]', pulses: 3 };
  },
  component:CardPyramidBuildGame,
};

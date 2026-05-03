import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSnakeLineState, CardSnakeLineAction, CardSnakeLineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardSnakeLineGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardSnakeLineGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSnakeLinePlugin: GamePlugin<CardSnakeLineState, CardSnakeLineAction, typeof settings> = {
  id:"card-snake-line", title:"Card Snake Line", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Long line of cards, alternating color earns. 16 draws.",
  howToPlay:"Card Snake Line is a 16-draw card mini. The 'snake' is a long winding line of cards, and each new card you draw must match the alternating color pattern. Specifically, every odd-indexed draw should be black and every even-indexed draw should be red — but the game simplifies this: each card scores 10 points if its color matches the round's expected color (alternating).\n\nConcretely, this game scores any card whose color matches the round-parity rule (round 1: red wins; round 2: black wins; round 3: red; round 4: black; etc.). Since each round is independent and cards are drawn randomly, the probability of matching is 50%, so expected scores are around 80 points across 16 rounds.\n\nIt's a cute, casual luck game — there's no choice, just press Draw, watch the line grow, and see how many color-matches the random snake delivers.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSnakeLineSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-snake-line-primary"]', pulses: 3 }), component:CardSnakeLineGame,
};

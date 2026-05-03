import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardVolcanoState, CardVolcanoAction, CardVolcanoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardVolcanoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardVolcanoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardVolcanoPlugin: GamePlugin<CardVolcanoState, CardVolcanoAction, typeof settings> = {
  id:"card-volcano", title:"Card Volcano", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"A volcano of cards. Defuse the highest cards for the most points.",
  howToPlay:"Card Volcano is a small luck-based card game built around a single deck. Each round, you draw one card from a freshly shuffled 52-card deck and earn points based on its rank.\n\nHigher-rank cards (a 'defused' high) score more — score = rank x 3. Twelve draws.\n\nThe game is brisk — there's nothing to choose besides \"Draw\" and \"Next\" — but the running total adds suspense as the rounds progress. Average runs land in the middle of the score range; lucky streaks of high or favored cards can push you well above. Replay with different seeds to see how variance treats you, and aim for a personal best by stringing together strong draws.\n\nPure variance means no two games feel the same. Tap Draw, see the card, and watch your score grow!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardVolcanoSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-volcano-primary"]', pulses: 3 }),component:CardVolcanoGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLadderState, CardLadderAction, CardLadderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardLadderGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardLadderGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardLadderPlugin: GamePlugin<CardLadderState, CardLadderAction, typeof settings> = {
  id:"card-ladder", title:"Card Ladder", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards must climb in rank by 1; track the longest ladder run. 14 draws.",
  howToPlay:"Card Ladder is a quick rank-streak minigame. You draw 14 cards one at a time, hoping each new card's rank is exactly one higher than the previous one.\n\nCard ranks count from 2 (low) to A (high) — so a 5 followed by a 6 extends your ladder, but a 5 followed by an 8 (or another 5) breaks it. When the ladder breaks, a new ladder of length 1 starts from the just-drawn card.\n\nYour final score equals the longest ladder you achieved at any point in the 14 draws, multiplied by 15. Because the chance of each successive card landing exactly +1 is roughly 4 in 51, expected longest ladders are short — anything over 3 is a good run, and 5+ is genuinely lucky.\n\nHit Draw 14 times to see your best climb. Suits don't matter — only the rank progression. Ascend!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardLadderSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-ladder-primary"]', pulses: 3 }), component:CardLadderGame,
};

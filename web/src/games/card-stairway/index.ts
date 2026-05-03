import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStairwayState, CardStairwayAction, CardStairwaySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardStairwayGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardStairwayGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStairwayPlugin: GamePlugin<CardStairwayState, CardStairwayAction, typeof settings> = {
  id:"card-stairway", title:"Card Stairway", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score when 5 cards come ascending in rank.",
  howToPlay:"Card Stairway deals you 5 random cards each round. If their ranks come up in non-decreasing order (each ≥ the previous, e.g. 2-2-5-J-K), you score 50 points. There are 8 rounds total.\n\nThe probability of 5 random cards landing in ascending rank is approximately 1/120 (small!), so big games hinge on a few lucky rounds. With 8 rounds, average expected score is around 30-50 points; a strong run can break 200.\n\nPress Deal to flip the 5 cards, then Next to advance. The hand is shown as dealt — your job is just to keep your fingers crossed. Pure RNG, low-skill, but uniquely satisfying when the staircase appears.\n\nA great relaxer between higher-stakes games. Quick rounds, occasional payoff, and a clean, simple rhythm.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStairwaySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-stairway-primary"]', pulses: 3 }), component:CardStairwayGame,
};

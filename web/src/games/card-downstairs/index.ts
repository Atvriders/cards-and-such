import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDownstairsState, CardDownstairsAction, CardDownstairsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardDownstairsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardDownstairsPlugin: GamePlugin<CardDownstairsState, CardDownstairsAction, typeof settings> = {
  id:"card-downstairs", title:"Card Downstairs", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score when 5 cards come descending in rank.",
  howToPlay:"Card Downstairs deals you 5 random cards each round. If their ranks come up in non-increasing order (each ≤ the previous, e.g. K-J-7-7-3), you score 50 points. There are 8 rounds total.\n\nThe probability of 5 random cards landing in descending rank is approximately 1/120 (just like ascending — small!), so big games hinge on a few lucky rounds. With 8 rounds, average expected score is around 30-50 points; a strong run can break 200.\n\nPress Deal to flip the 5 cards, then Next to advance. The hand is shown as dealt — your job is just to root for the descent. Pure RNG, low-skill, but uniquely satisfying when the K-Q-J-... chain materializes.\n\nThe mirror twin to Card Stairway. A great quick rhythm filler between heavier games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardDownstairsSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-downstairs-primary"]', pulses: 3 }), component:CardDownstairsGame,
};

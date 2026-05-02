import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTrioQuestState, CardTrioQuestAction, CardTrioQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTrioQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTrioQuestPlugin: GamePlugin<CardTrioQuestState, CardTrioQuestAction, typeof settings> = {
  id:"card-trio-quest", title:"Card Trio Quest", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find rank trios across 18 draws. +60 each trio.",
  howToPlay:"Card Trio Quest is an 18-draw rank-tripling game. Each draw flips a single random card from a fresh shuffle. The game keeps a running tally of how many of each rank you've seen.\n\nWhen the same rank appears THREE times, that's a trio — worth 60 points! After a trio is scored, that rank's count resets to zero and you can chase it again from scratch.\n\nAcross 18 draws, an even-luck run produces about 1-2 trios; lucky games might hit 3-4. The base probability of a single trio in 18 draws is around 50% — so half the time you walk away with 60+ points, the other half you finish at zero (no trios) or with bonus runs at 120+. Expected average is roughly 60-90 points.\n\nPress Draw to flip the next card. The deck refreshes each draw, so cards repeat freely. There's no input beyond drawing — pure rank luck. Hunt those triples!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTrioQuestSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-trio-quest-primary"]', pulses: 3 }),component:CardTrioQuestGame,
};

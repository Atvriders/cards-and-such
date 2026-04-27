import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardQuadQuestState, CardQuadQuestAction, CardQuadQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardQuadQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardQuadQuestPlugin: GamePlugin<CardQuadQuestState, CardQuadQuestAction, typeof settings> = {
  id:"card-quad-quest", title:"Card Quad Quest", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Find rank quads across 20 draws. +100 each quad.",
  howToPlay:"Card Quad Quest is a 20-draw rank-quadrupling chase. Each draw flips a single random card from a fresh shuffle. The game tracks how many of each rank (2 through Ace) you've seen.\n\nWhen the same rank appears FOUR times, that's a quad — worth 100 points! After scoring, that rank's count resets to zero. Hunt for new quads in the remaining draws.\n\nWith 13 possible ranks and only 20 draws, scoring even one quad is a real achievement — the base probability is about 20%. So roughly 1 in 5 games end with at least 100 points; 4 in 5 finish at zero. The lucky runs that converge twice on the same rank score 200+; the unicorn games that score 3 quads (300 points) are once-in-a-blue-moon.\n\nPress Draw to flip the next card. The deck refreshes per draw, so cards can repeat. There's no input beyond drawing — pure rank luck. Hunt those four-of-a-kinds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardQuadQuestSettings),
  reducer,isTerminal,component:CardQuadQuestGame,
};

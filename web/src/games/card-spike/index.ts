import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSpikeState, CardSpikeAction, CardSpikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSpikeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardSpikePlugin: GamePlugin<CardSpikeState, CardSpikeAction, typeof settings> = {
  id:"card-spike", title:"Card Spike", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spike a card to a target rank: 12 rounds.",
  howToPlay:"Card Spike is a 12-round target-rank guessing card mini. Each round shows you a target rank (anywhere from 2 to Ace) and asks you to draw a single card. If the drawn card's rank matches the target, you score a clean 25 points: otherwise zero.\n\nTap Spike to draw. The card is revealed instantly along with the result. Press Next to advance: a fresh target rank is generated each round.\n\nThe math is simple: each rank has 4 cards (one per suit) out of 52, giving you a 4 of 52 hit rate (about 7.7 percent). Expected score across 12 rounds is around 23 points (1 hit out of 12). Lucky players hitting 3 or more in a session push past 75 points; an exceptionally lucky run could clear 100.\n\nThere is nothing to strategize: Card Spike is a pure variance game, like a one-shot lottery rebuilt twelve times. Spike often, spike loud, and let the deck decide whether you walk away with a smile or a shrug.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardSpikeSettings),
  reducer,isTerminal,component:CardSpikeGame,
};

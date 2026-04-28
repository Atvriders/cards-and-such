import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTrainTrackState, CardTrainTrackAction, CardTrainTrackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTrainTrackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTrainTrackPlugin: GamePlugin<CardTrainTrackState, CardTrainTrackAction, typeof settings> = {
  id:"card-train-track", title:"Card Train Track", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lay 8 cards as railroad ties. Red cards are good wood, black cards rot.",
  howToPlay:"Card Train Track is an 8-round card mini. You're laying ties on a fresh railroad bed. Each round draws a card representing the next tie. Red ties (hearts and diamonds) are sturdy oak and score 15 points. Black ties (spades and clubs) are rotted and score 5 points.\\n\\nThere's no choice or skill — the deck deals the ties. Press Draw to lay the next tie, see how solid it is, then Next to keep building track. With a 50/50 red/black split, the expected average score is 80 points over 8 rounds.\\n\\nLucky runs with 6+ red cards push 100+; black-card-heavy runs scrape around 50. A short, charming card mini perfect for a quick play. Watch the track stretch out into the distance and aim for a top-rank rail line. All aboard!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTrainTrackSettings),
  reducer,isTerminal,component:CardTrainTrackGame,
};

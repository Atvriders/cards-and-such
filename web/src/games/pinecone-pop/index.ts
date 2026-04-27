import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineconePopState, PineconePopAction, PineconePopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineconePopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pineconePopPlugin: GamePlugin<PineconePopState, PineconePopAction, typeof settings> = {
  id:"pinecone-pop", title:"Pinecone Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop pinecones bouncing through the conifer canopy. 30-second clicker.",
  howToPlay:"Pinecone Pop is a 30-second clicker set in a coniferous forest. Pinecones (represented by pine tree icons here) bounce through six lanes — tap each one before it disappears for 10 points apiece.\n\nThe game ticks roughly once per second; new pinecones spawn at random lanes. Each one persists a few ticks before falling away, so quick clicking matters.\n\nNo strategy required beyond reaction time and aim. Average runs land around 200-300 points; sharpshooters pushing 500+ are operating at peak forager reflexes. The clock counts down in the top right; at zero your score locks.\n\nTip: don't lock onto a single column — spread your gaze across the whole canopy and grab the oldest, fadest cones first. They're the ones about to drop. A great game for a quick reflex break with autumn vibes! Tap-tap-tap!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PineconePopSettings),
  reducer,isTerminal,component:PineconePopGame,
};

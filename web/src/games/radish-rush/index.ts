import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RadishRushState, RadishRushAction, RadishRushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RadishRushGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const radishRushPlugin: GamePlugin<RadishRushState, RadishRushAction, typeof settings> = {
  id:"radish-rush", title:"Radish Rush", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click radishes before they sprout away. 25-second click-to-pop arcade.",
  howToPlay:`Radish Rush is a tight 25-second clicker. Radishes pop up on the garden patch in six lanes; tap each one before it sprouts and disappears to score 10 points apiece.

The game ticks just under once per second, spawning new radishes in random lanes. Each radish lingers a few ticks before vanishing — miss a radish and it's gone forever, no points awarded. The shorter timer (25 seconds versus the usual 30) makes every second count: keep your eyes scanning all six lanes and your finger ready.

There's no skill ceiling: the more radishes you tap inside the time limit, the higher your final score. Average runs land around 200 points; sharpshooters hitting 350+ are doing real reflex work. The clock counts down in the top right; when it hits zero, the harvest ends and your final score is locked in.

Get those radishes before they bolt!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RadishRushSettings),
  reducer,isTerminal,component:RadishRushGame,
};

import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrogFlickState, FrogFlickAction, FrogFlickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FrogFlickGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const frogFlickPlugin: GamePlugin<FrogFlickState, FrogFlickAction, typeof settings> = {
  id:"frog-flick", title:"Frog Flick", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click the leaping frogs as fast as you can. 30-second clicker.",
  howToPlay:"Frog Flick is a 30-second tap arcade. Frogs leap onto the screen in six lanes — your job is to flick them away by clicking each one before it disappears.\n\nEvery frog tapped is worth 10 points; missed frogs (those that hop off-screen before you click) cost nothing but a missed opportunity. The board ticks roughly once per second, spawning 1-2 new frogs in random lanes each beat.\n\nThere's no skill ceiling: the more frogs you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. Watch the lily-pad layout: a frog can appear anywhere across the six columns, so keep your eyes sweeping the board.\n\nThe clock counts down in the top right; when it hits zero, your final tally locks in. Ribbit, ribbit — flick those frogs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FrogFlickSettings),
  reducer,isTerminal,component:FrogFlickGame,
};

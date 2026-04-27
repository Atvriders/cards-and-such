import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChickChaseState, ChickChaseAction, ChickChaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChickChaseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const chickChasePlugin: GamePlugin<ChickChaseState, ChickChaseAction, typeof settings> = {
  id:"chick-chase", title:"Chick Chase", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click waddling chicks as fast as you can. 30-second clicker.",
  howToPlay:"Chick Chase is a 30-second tap arcade. Chicks waddle onto the screen in six lanes — your job is to gently click each one before it toddles off the board.\n\nEvery chick tapped is worth 10 points; chicks that escape don't subtract from your score, just from your bragging rights. The board ticks about once per second, with 1-2 new chicks spawning in random lanes each beat.\n\nThere's no skill ceiling: the more chicks you tag in 30 seconds, the higher your score. Average runs land near 200-300 points; quick-eyed players pushing 500+ are showing real reflex talent. The chicks don't move particularly fast, but the board fills up quickly — split your attention across all six columns.\n\nThe clock counts down in the top right; when it hits zero, your final tally locks in. Cheep cheep — chase those chicks!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChickChaseSettings),
  reducer,isTerminal,component:ChickChaseGame,
};

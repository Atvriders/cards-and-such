import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpikeballState, DiceSpikeballAction, DiceSpikeballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpikeballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpikeballPlugin: GamePlugin<DiceSpikeballState, DiceSpikeballAction, typeof settings> = {
  id:"dice-spikeball", title:"Dice Spikeball", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roundnet 4-person net-slam; 15 rallies.",
  howToPlay:"Dice Spikeball (Roundnet) simulates the four-player ball-on-trampoline-net sport that exploded out of college campuses into a competitive global circuit. Teams of two volley a ball off a small ground-level net, returning it within three touches.\n\nEach of 15 rallies you Roll four dice (your team's three touches plus a serve). A successful rally scores points based on dice patterns: any 6 = +1 (sharp hit), pair of 6s = +2, three or four 6s = +3 (perfect spike). A rally containing no values 4-6 = -1 (your team netted out).\n\nA typical rally scores 0-2; hot rallies with multiple 6s land 3-4; cold rallies cost 1. Fifteen rallies totalling 12-25 is a competitive game; the maximum is 45.\n\nReal spikeball/roundnet has a fully professional tour and championship structure now — Roundnet Association tournaments draw crowds. This mini compresses the four-touch chaos into solo dice play. Press Roll, Next. Quick, modern, beachy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSpikeballSettings),
  reducer,isTerminal,component:DiceSpikeballGame,
};

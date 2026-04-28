import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMolkkyState, DiceMolkkyAction, DiceMolkkySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMolkkyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMolkkyPlugin: GamePlugin<DiceMolkkyState, DiceMolkkyAction, typeof settings> = {
  id:"dice-molkky", title:"Dice Molkky", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Finnish skittle pin-throw; 12 throws.",
  howToPlay:"Dice Molkky simulates the Finnish lawn sport where players throw a wooden pin at numbered skittles, scoring either the single number when one falls or the count of fallen pins when more than one falls. The aim is to land exactly on 50 — going over rebooks you to 25.\n\nIn this mini each of 12 rounds you Roll two dice. If both dice match (doubles), you score the matching number (single skittle hit, 1-6 points). If they differ, you score 2 points (multi-pin hit).\n\nReal Molkky's exact-score rule is famously brutal — overshooting 50 means a reset to 25 and crushing morale. We don't enforce the reset here, just sum scores. A typical run totals 25-40; a hot run with frequent doubles cracks 50; the max — twelve double-sixes — gives 72.\n\nMolkky is huge in Finland and growing in France and beyond, with an annual World Championship in Lahti. This mini gives a quick taste of the rhythm: throw, count, advance. Press Roll, Next. Unmistakably Finnish.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMolkkySettings),
  reducer,isTerminal,component:DiceMolkkyGame,
};

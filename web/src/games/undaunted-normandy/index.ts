import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UndauntedNormandyState, UndauntedNormandyAction, UndauntedNormandySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UndauntedNormandyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const undauntedNormandyPlugin: GamePlugin<UndauntedNormandyState, UndauntedNormandyAction, typeof settings> = {
  id:"undaunted-normandy",
  title:"Undaunted Normandy",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"WWII deckbuilder; squad maneuvers on a map.",
  howToPlay:"Undaunted Normandy is a ten-round WWII-themed card game inspired by Osprey Games' Undaunted: Normandy, where squad cards maneuver platoons across a tactical map. Each round, three cards reveal from a deck of soldiers and orders: Rifleman (3), Sergeant (4), Scout (2), Officer (5), Strike (6). The sum is your round score. 🪖\n\nThe deck averages 12 per round; Strike pulls reach 15. Scout-heavy rounds dip to 7. Across ten rounds expect totals near 100 to 130.\n\nPress Draw to reveal three squad cards, Next to advance the operation, and Finish on round ten. Score 130+ to capture Normandy with valour. The game completes in well under a minute, distilling Undaunted's tense WWII squad-action drama into a compact card session that retains the original's tactical flavour and replay appeal.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UndauntedNormandySettings),
  reducer,
  isTerminal,
  component:UndauntedNormandyGame,
};

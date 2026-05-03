import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TinyEpicGalaxiesMiniState, TinyEpicGalaxiesMiniAction, TinyEpicGalaxiesMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TinyEpicGalaxiesMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: TinyEpicGalaxiesMiniState): HintTarget | null => (state.phase === "rolling" ? { selector: ".dm-btn", pulses: 3 } : null);

export const tinyEpicGalaxiesMiniPlugin: GamePlugin<TinyEpicGalaxiesMiniState, TinyEpicGalaxiesMiniAction, typeof settings> = {
  id:"tiny-epic-galaxies-mini",
  title:"Tiny Epic Galaxies Mini",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll civilization dice to colonize.",
  howToPlay:"Tiny Epic Galaxies Mini is a 10-round civilization dice game inspired by the small-box favorite. Each round you roll five six-sided dice. Each face represents an action: 1=Move, 2=Energy, 3=Culture, 4=Diplomacy, 5=Colonize, 6=Advance. Sum all five for your base score. 🌌\n\nColony bonus: each 5 (Colonize) and 6 (Advance) doubles its value, so 5 contributes 10 and 6 contributes 12. Across 10 rounds expect totals near 200 to 250.\n\nPress Roll to spin five action dice, then Next to advance the next round. The 5s and 6s glow gold for emphasis. Score 230+ to claim galactic supremacy. The display shows each die clearly. Inspired by the beloved tiny-box civilization game, this miniature evokes its quick rolling rhythm in a fantasy-flavored, quick-finishing run perfect for a short break under a minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TinyEpicGalaxiesMiniSettings),
  reducer, isTerminal, hint: hint, component:TinyEpicGalaxiesMiniGame,
};

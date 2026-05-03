import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollForGalaxyMiniState, RollForGalaxyMiniAction, RollForGalaxyMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollForGalaxyMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: RollForGalaxyMiniState): HintTarget | null => (state.phase === "rolling" ? { selector: ".dm-btn", pulses: 3 } : null);

export const rollForGalaxyMiniPlugin: GamePlugin<RollForGalaxyMiniState, RollForGalaxyMiniAction, typeof settings> = {
  id:"roll-for-galaxy-mini",
  title:"Roll For Galaxy Mini",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Galactic civilization dice game.",
  howToPlay:"Roll For Galaxy Mini is a 10-round civilization-building dice game. Each round you roll five custom dice. Each face is one of five actions: Explore (1), Develop (2), Settle (3), Produce (4), Ship (5), Wild (6). Sum all five for the round base. 🚀\n\nIf you roll three or more of the same action, you trigger that phase and earn a 5-point synergy bonus. Average rounds score about 15. Triple matches push to 20+. Across 10 rounds expect totals near 150 to 190.\n\nPress Roll to spin the galactic dice, then Next to begin the next turn. Matching trios are highlighted in gold. Score 175+ to be Roll for Galaxy master. The compact UI shows each die's action. Inspired by the bag-builder favorite, this miniature evokes its quick rolling rhythm in a fantasy-tinged run finishing in less than a minute. Quick, breezy galactic fun.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RollForGalaxyMiniSettings),
  reducer, isTerminal, hint: hint, component:RollForGalaxyMiniGame,
};

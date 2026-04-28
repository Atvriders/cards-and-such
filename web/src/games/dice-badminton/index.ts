import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBadmintonState, DiceBadmintonAction, DiceBadmintonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBadmintonGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBadmintonPlugin: GamePlugin<DiceBadmintonState, DiceBadmintonAction, typeof settings> = {
  id:"dice-badminton", title:"Dice Badminton", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Shuttle smash and rally; first to 21.",
  howToPlay:"Dice Badminton simulates the indoor racquet sport played with a feather shuttlecock over a high net. Real badminton games race to 21 points (must win by 2) with shuttle speeds reaching 200mph during smashes — the fastest racquet sport.\n\nEach round (rally) you Roll three dice. Point mapping: dice contains a 6 and a 5 = smash winner (+1), dice all 1-3 = net error (-1), dice sum >=14 = your point (+1), dice sum <=7 = opponent point (-1), other rolls = continued rally (no score). Game ends at 21 your points or after 35 rounds.\n\nFinal score equals 70 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Average runs land between 95 and 140; a 21-low sweep can clear 170.\n\nReal badminton dominates Asian and European competitive sport, with deep shadow games of feathery deception, acrobatic dives and explosive smashes. This mini abstracts the rally into dice. Press Roll, Next. Quick, distinctly international.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBadmintonSettings),
  reducer,isTerminal,component:DiceBadmintonGame,
};

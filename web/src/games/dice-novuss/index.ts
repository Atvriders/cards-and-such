import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceNovussState, DiceNovussAction, DiceNovussSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceNovussGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceNovussPlugin: GamePlugin<DiceNovussState, DiceNovussAction, typeof settings> = {
  id:"dice-novuss", title:"Dice Novuss", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Latvian carrom-hybrid boardsport; 8 ends.",
  howToPlay:"Dice Novuss simulates the Latvian table sport — sometimes called 'Latvian carrom' or 'square billiards' — played on a felt-topped square board where players flick or strike pucks toward the four corner pockets using a long cue and small striker disc.\n\nEach of 8 ends you Roll three dice (your three striker shots). Die values map: 6 = pocketed corner (4 points), 5 = pocketed plus rebound (3 points), 4 = pocketed (2 points), 3 = on the board only (1 point), 1-2 = scratch (0).\n\nA typical end scores 4-7 points; a hot end with multiple 5-6s lands 10+; the absolute maximum (three 6s) is 12. Eight ends totalling 35-55 is a normal game; the max is 96.\n\nReal novuss is a national sport of Latvia with hundreds of clubs and a dedicated international federation. The mix of cue-strike precision and carrom-style pocketing makes it unique. This mini compresses precise striker work into dice. Press Roll, Next. Distinctively Baltic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceNovussSettings),
  reducer,isTerminal,component:DiceNovussGame,
};

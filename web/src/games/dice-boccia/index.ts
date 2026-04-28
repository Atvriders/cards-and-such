import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBocciaState, DiceBocciaAction, DiceBocciaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBocciaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBocciaPlugin: GamePlugin<DiceBocciaState, DiceBocciaAction, typeof settings> = {
  id:"dice-boccia", title:"Dice Boccia", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Paralympic precision-ball; 6 ends.",
  howToPlay:"Dice Boccia simulates the Paralympic precision-ball sport derived from bocce but played on indoor courts. Boccia is one of only two Paralympic sports without an Olympic equivalent and demands extraordinary fine motor control.\n\nEach of 6 ends you Roll four dice (your four boccia balls). Each die scores points based on closeness to the target: 3 = 3 points (in the target zone), 4 = 2, 2 = 2, 5 = 1, 1 = 0, 6 = 0.\n\nA typical end produces 5-7 points; a fine end with multiple 3-4 dice can score 10+. Six ends totalling 30-45 is a strong game. The maximum (twelve points per end) is 72.\n\nReal boccia is graded by impairment classifications, and skilled athletes can roll, throw or use ramps to deliver balls with extraordinary accuracy. This mini abstracts all that into compact dice play while keeping the structural rhythm — four balls per end, six ends, score advances by closeness. Press Roll, Next. A respectful nod to a precision sport that deserves wider recognition.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBocciaSettings),
  reducer,isTerminal,component:DiceBocciaGame,
};

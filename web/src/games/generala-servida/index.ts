import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeneralaServidaState, GeneralaServidaAction, GeneralaServidaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GeneralaServidaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const generalaServidaPlugin: GamePlugin<GeneralaServidaState, GeneralaServidaAction, typeof settings> = {
  id:"generala-servida", title:"Generala Servida", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Single-roll Generala. Roll 5 dice once per round; score Latin-American Generala categories. 8 rounds.",
  howToPlay:"Generala Servida is the single-roll variant of Generala — the South American cousin of Yahtzee. Each round you roll five dice exactly once. There are no rerolls and no held dice. Whatever pattern lands on the table is what you score.\n\nScoring categories scanned automatically: Five-of-a-kind (Generala) = 50, Four-of-a-kind (Poker) = 40, Full House = 30, Straight (1-2-3-4-5 or 2-3-4-5-6) = 25, Three-of-a-kind = 20, otherwise the highest pair value × 2. The system always assigns the best possible category for your roll.\n\nThere are 8 rounds in a game. Because you only get one roll, luck dominates — but the variance also makes any individual session tense. Average expected scores cluster around 100-160 points. A \"served\" five-of-a-kind on the first roll is the dream outcome and a true Generala Servida.\n\nSimple, classic, and refreshingly fast.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GeneralaServidaSettings),
  reducer,isTerminal,component:GeneralaServidaGame,
};

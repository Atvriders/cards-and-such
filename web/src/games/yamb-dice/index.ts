import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YambDiceState, YambDiceAction, YambDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YambDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const yambDicePlugin: GamePlugin<YambDiceState, YambDiceAction, typeof settings> = {
  id:"yamb-dice", title:"Yamb", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Balkan Yacht-family dice with declaration columns. Single-roll scoring across 10 rounds.",
  howToPlay:"Yamb is a Balkan dice game in the Yacht/Yahtzee family famous for its declaration columns and elaborate scoring. This compact version distills the experience into 10 rounds of single-roll scoring.\n\nEach round you roll five dice once. The system identifies the best applicable Yamb scoring category and awards points: Yamb (5-of-a-kind) = 60, Poker (4-of-a-kind) = 50, Full = 40, Straight (1-5 or 2-6) = 35, Three-of-a-kind = 25, Pair value = pair-face × 2.\n\n10 rounds gives you ten opportunities to claim major categories. Average expected total: 200-320 points. A perfect run of Yambs would score 600, but realistically you'll see 1-2 across a session.\n\nYamb's appeal is its swing: a single big roll can boost your score by 20% in one round. The pace is fast, the math is automatic, and you're always one Yamb away from a comeback. Roll boldly!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as YambDiceSettings),
  reducer,isTerminal,component:YambDiceGame,
};

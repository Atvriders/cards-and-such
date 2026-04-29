import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice301DartsState, Dice301DartsAction, Dice301DartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice301DartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice301DartsPlugin: GamePlugin<Dice301DartsState, Dice301DartsAction, typeof settings> = {
  id:"dice-301-darts", title:"301 Darts Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"301-darts variant: 10 throws, 2 dice per throw.",
  howToPlay:"301 Darts Dice distills the 301 darts-pub variant into a quick 10-throw dice game. Each throw you roll two dice; the sum (2-12) represents pins from your dart on the wedge — high rolls are 18-and-up sectors, low rolls are inner singles. Add up totals across all 10 throws for your final score. 301 Darts is the lower-starting variant of the standard 501 game where you start at 301 points and subtract each throw's score, aiming to land exactly on zero with a double. The 'double-out' rule is the same as 501. 301 is faster than 501 — typically 6-8 minutes per leg vs 10-12 for 501 — making it great for casual pub leagues. This dice mini abstracts the throw spread into 2d6 sums. Expected per-throw average 7, total 70 across 10 throws. Hot streaks push 100; cold slip to 50. Press Roll, Next. Quick fix for darts-card fans.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice301DartsSettings),
  reducer,isTerminal,component:Dice301DartsGame,
};

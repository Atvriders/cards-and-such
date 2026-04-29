import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFatBoyDartsState, DiceFatBoyDartsAction, DiceFatBoyDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFatBoyDartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFatBoyDartsPlugin: GamePlugin<DiceFatBoyDartsState, DiceFatBoyDartsAction, typeof settings> = {
  id:"dice-fat-boy-darts", title:"Fat-Boy Darts Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fat-Boy easier-darts: 10 throws, 2 dice per throw.",
  howToPlay:"Fat-Boy Darts Dice distills the Fat-Boy darts variant — designed for casual home dart play with bigger target sectors — into a quick 10-throw dice game. Each throw you roll two dice; the sum (2-12) represents your wedge result, with no double-out requirement (Fat-Boy's signature easing of standard rules). Add up totals across all 10 throws for your final score. Fat-Boy Darts was popularized in the 1990s as a beginner-friendly alternative to standard 501 with larger target sectors and no double-out rule. It works great for kids, casual families, and pub-league newcomers — anyone who finds standard darts intimidating but still wants to chuck darts at a board. This dice mini abstracts the throw spread into 2d6 sums. Expected per-throw average 7, total 70 across 10 throws. Hot streaks push 100; cold slip to 50. Press Roll, Next. Friendly quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFatBoyDartsSettings),
  reducer,isTerminal,component:DiceFatBoyDartsGame,
};

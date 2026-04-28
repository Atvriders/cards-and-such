import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePinballState, DicePinballAction, DicePinballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePinballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePinballPlugin: GamePlugin<DicePinballState, DicePinballAction, typeof settings> = {
  id:"dice-pinball", title:"Dice Pinball", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Launch two dice as pinballs through bumpers; multipliers boost your score over 8 rounds.",
  howToPlay:`Dice Pinball treats two six-sided dice as pinballs ricocheting off bumpers. Each round you press LAUNCH and two dice roll. Bumper multipliers apply based on the result:

- Doubles (matching dice) — 2.0x bonus
- Sum 10 or higher — 1.5x bonus
- Sum 4 or lower — 0.5x penalty
- Otherwise — 1.0x

Base points equal the dice sum × 5; the multiplier is then applied and the result is rounded to the nearest whole number. So a double-six (sum 12) at 2x scores 12 × 5 × 2 = 120 points, while a 1-2 at 0.5x scores just 7 (rounded from 7.5).

There are 8 rounds total. Press LAUNCH to roll, then Next Round to continue. The game tracks per-round points and totals. Maximum theoretical score is around 480 (8 double-sixes); realistic averages are 200–280.

Pure luck — but the multiplier suspense gives the game a satisfying pinball-machine feel. Good launching!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePinballSettings),
  reducer, isTerminal, component: DicePinballGame,
};

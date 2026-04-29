import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGulfDartsState, DiceGulfDartsAction, DiceGulfDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGulfDartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceGulfDartsPlugin: GamePlugin<DiceGulfDartsState, DiceGulfDartsAction, typeof settings> = {
  id:"dice-gulf-darts", title:"Gulf Darts Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Gulf-region around-the-clock darts: 12 throws, 2 dice per throw.",
  howToPlay:"Gulf Darts Dice distills the Arab Gulf region's around-the-clock darts variant into a quick 12-throw dice game. Each throw you roll two dice; the sum (2-12) represents your darting on the next wedge in sequence — going around the dartboard from 1 to 20 systematically rather than going for inner doubles or trebles. Add up totals across all 12 throws for your final score. Gulf-region darts (also known as Around the Clock or Around the World in some places) is a popular casual darts variant where players hit each numbered wedge in sequence — 1, 2, 3, 4, etc. — moving systematically around the board until reaching 20. It's a beginner-friendly format teaching dart placement and is hugely popular in Gulf-region pub circuits. This dice mini abstracts the throw spread into 2d6 sums. Expected per-throw average 7, total 84 across 12 throws. Hot streaks push 110; cold slip to 60. Press Roll, Next. Quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceGulfDartsSettings),
  reducer,isTerminal,component:DiceGulfDartsGame,
};

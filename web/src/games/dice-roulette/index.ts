import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRouletteState, DiceRouletteAction, DiceRouletteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRouletteGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRoulettePlugin: GamePlugin<DiceRouletteState, DiceRouletteAction, typeof settings> = {
  id:"dice-roulette", title:"Dice Roulette", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet on a dice-sum bucket like roulette colors. Three dice rolled per round, ten rounds.",
  howToPlay:`Dice Roulette plays like a casino roulette wheel mapped to three dice. Each round, you choose one of four buckets representing the sum of three six-sided dice: Low (3-6), Mid (7-10), High (11-14), or Boom (15-18). Three dice are then rolled.

If your bucket matches the actual sum, you score 10 points. Two special exact-roll bonuses sweeten the pot: rolling exactly 7 with a Mid bet pays 20 (double) and rolling exactly 18 with a Boom bet pays a jackpot 30.

There are 10 rounds. The probability distribution of three-dice sums is bell-shaped, peaking at 10-11. Mid and High are common (each about 38%), while Low (about 12%) and Boom (about 12%) are rarer. Riskier bets pay only the same base ten unless you hit an exact-roll bonus, so smart play favors Mid or High most of the time. Average expected scores are around 35; a great game is 60+.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRouletteSettings),
  reducer,isTerminal,component:DiceRouletteGame,
};

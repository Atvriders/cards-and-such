import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpinState, DiceSpinAction, DiceSpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpinGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpinPlugin: GamePlugin<DiceSpinState, DiceSpinAction, typeof settings> = {
  id:"dice-spin", title:"Dice Spin", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet over, under, or equal 7 on a 2-dice roll. Equal pays triple!",
  howToPlay:`Dice Spin is a simple casino-style dice betting game. Each round, you bet on whether the sum of two six-sided dice will be Over 7, Under 7, or Equal to 7. The dice are rolled, and you score based on your bet:

- Over 7 (sum > 7) wins 10 points (probability ~42%)
- Under 7 (sum < 7) wins 10 points (probability ~42%)
- Equal 7 (sum = 7) wins 30 points (probability ~17%)

You play 10 rounds. The expected value of each bet is roughly the same — Over and Under each give about 4.2 points per round on average, while Equal gives about 5 points per round on average. So Equal is mathematically the best bet — but it loses 5 out of 6 times, making for a streaky game.

Average expected scores hover around 40-50 points for safe play, with bold all-Equal players sometimes hitting 90+ on lucky games. Mix it up, follow your gut, and enjoy the spin!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSpinSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-spin-roll"]', pulses: 3 }; },
  component:DiceSpinGame,
};

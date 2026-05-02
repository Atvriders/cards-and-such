import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpinnerState, DiceSpinnerAction, DiceSpinnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpinnerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpinnerPlugin: GamePlugin<DiceSpinnerState, DiceSpinnerAction, typeof settings> = {
  id:"dice-spinner", title:"Dice Spinner", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet on each of 30 rolls of a single die: high (4-6), low (1-3), or even.",
  howToPlay:`Dice Spinner is a 30-roll betting game. Each turn, you choose one of three bets before a single die is rolled: Low (1, 2, or 3), High (4, 5, or 6), or Even (2, 4, or 6). If the die lands matching your bet, you score 5 points. Wrong bets earn nothing.

Each bet has a 50% probability of winning (Low and High are obviously 3/6 each; Even is also 3/6, but with overlap). Across 30 rolls, the maximum score is 150, and the expected average is 75.

Settle into a rhythm: pick a bet, watch the die spin, see the result, hit Next. The simple loop encourages you to chase patterns or stick with one strategy. Try alternating between Low and Even to maximize coverage, or commit to a single bet for the streaks.

Light, snappy, and pure 50/50 luck — Dice Spinner is the perfect background game when you want a casual roll-and-bet flow!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSpinnerSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-spinner-roll"]', pulses: 3 }; },
  component:DiceSpinnerGame,
};

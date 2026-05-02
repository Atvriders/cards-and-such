import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSlowRollState, DiceSlowRollAction, DiceSlowRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSlowRollGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceSlowRollPlugin: GamePlugin<DiceSlowRollState, DiceSlowRollAction, typeof settings> = {
  id:"dice-slow-roll", title:"Dice Slow Roll", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and win if the total is 8 or less — the lower the better!",
  howToPlay:`Dice Slow Roll flips the usual dice logic — you want a LOW total. Roll three dice and win your bet if the sum is 8 or under. Three dice range from 3 (three 1s) to 18 (three 6s). Totals of 8 or less occur roughly 40% of the time.

Before each roll, set your wager. A low roll wins; a high roll loses. This game rewards patience and careful stakes — don't bet everything on each slow roll!

Start with 100 coins. Choose 8 or 12 rounds in Settings. Your final coin total is your score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSlowRollSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-slow-roll-roll"]', pulses: 3 }; },
  component:DiceSlowRollGame,
};

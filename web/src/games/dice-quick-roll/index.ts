import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceQuickRollState, DiceQuickRollAction, DiceQuickRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceQuickRollGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceQuickRollPlugin: GamePlugin<DiceQuickRollState, DiceQuickRollAction, typeof settings> = {
  id:"dice-quick-roll", title:"Dice Quick Roll", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fast-paced dice game — roll 3 dice and win if the sum is 12 or more!",
  howToPlay:`Dice Quick Roll is all about speed and momentum. Roll three dice each round and win your bet if the total is 12 or higher. Before rolling, choose a wager amount. The minimum winning total of 12 is achievable with two 4s and a 4, or many other combinations.

About 40% of rolls reach 12 or above with three dice, making this a nearly even game with good betting discipline.

Start with 100 coins. Choose 8 or 12 rounds. Your final coin total is your score. Quick sessions, quick decisions, quick wins!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceQuickRollSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-quick-roll-roll"]', pulses: 3 }; },
  component:DiceQuickRollGame,
};

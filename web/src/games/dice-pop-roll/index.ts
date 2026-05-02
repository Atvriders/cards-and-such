import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePopRollState, DicePopRollAction, DicePopRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePopRollGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dicePopRollPlugin: GamePlugin<DicePopRollState, DicePopRollAction, typeof settings> = {
  id:"dice-pop-roll", title:"Dice Pop Roll", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and win if at least two dice show the same value — pop a pair!",
  howToPlay:`Dice Pop Roll rewards pairs. Roll three dice each round and win your bet if at least two of the dice show the same number. A pair of 3s counts, a triplet counts even better (it is still a pair), and any other matched combo wins.

With three dice, rolling a pair or better happens more than half the time — so this game gives you a slight statistical edge if you manage your bets wisely.

Start with 100 coins. Choose 8 or 12 rounds in Settings. Each pair that pops earns your bet back plus profit. Your final coin total is your score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePopRollSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-pop-roll-roll"]', pulses: 3 }; },
  component:DicePopRollGame,
};

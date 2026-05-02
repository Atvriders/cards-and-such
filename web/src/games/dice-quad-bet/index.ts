import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceQuadBetState, DiceQuadBetAction, DiceQuadBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceQuadBetGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceQuadBetPlugin: GamePlugin<DiceQuadBetState, DiceQuadBetAction, typeof settings> = {
  id:"dice-quad-bet", title:"Dice Quad Bet", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and bet whether the total sum will be 15 or higher to win!",
  howToPlay:`Dice Quad Bet is a sum-based dice betting game. Roll three dice and try to land a total of 15 or more. Before the roll, bet any amount from your current coins. A total of 15 or higher wins your bet; anything less loses it.

Three dice can total 3 to 18. The median total is around 10-11, so reaching 15+ happens slightly less than half the time — but with smart bet sizing you can grow your coins steadily.

Start with 100 coins. Choose 8 or 12 rounds in Settings. Your final coin total is your score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceQuadBetSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-quad-bet-roll"]', pulses: 3 }; },
  component:DiceQuadBetGame,
};

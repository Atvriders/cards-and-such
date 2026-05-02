import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFlushBetState, DiceFlushBetAction, DiceFlushBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFlushBetGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceFlushBetPlugin: GamePlugin<DiceFlushBetState, DiceFlushBetAction, typeof settings> = {
  id:"dice-flush-bet", title:"Dice Flush Bet", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and bet whether all three will be consecutive numbers (a flush) to win!",
  howToPlay:`Dice Flush Bet challenges you to roll three dice and hope for a flush — all three dice showing consecutive numbers (like 2-3-4 or 4-5-6). Before each roll, bet any amount from your coins. If the three dice land on consecutive values in any order, you win your bet. Any other combination loses it.

Start with 100 coins. Choose 8 or 12 rounds in Settings.

A flush has roughly 1-in-9 odds naturally, so bet conservatively and celebrate when it hits. Watch your coins carefully — each miss costs your stake. Your final coin total is your score. Can you ride the flushes to a big stack?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFlushBetSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-flush-bet-roll"]', pulses: 3 }; },
  component:DiceFlushBetGame,
};

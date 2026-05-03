import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceColorBetState, DiceColorBetAction, DiceColorBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceColorBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceColorBet as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceColorBetPlugin: GamePlugin<DiceColorBetState, DiceColorBetAction, typeof settings> = {
  id: "dice-color-bet", title: "Dice Color Bet", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll 2 dice and bet Red (odd sum) or Blue (even sum). Near 50/50 odds on every roll.",
  howToPlay: `Dice Color Bet is a simple coin-flip style dice game. Each round, you bet on the color — Red means the sum of two dice will be odd; Blue means the sum will be even.

Two dice summing odd or even are almost exactly equal in probability (18 odd vs 18 even out of 36 combinations — it's a perfect 50/50). This makes every bet a pure test of luck and bankroll management.

Start with 100 coins. Choose a bet amount, pick Red or Blue, and the dice roll. Win and your coins increase by your bet; lose and they decrease. Run out of coins or finish all rounds to end.

Settings allow 10 or 20 rounds. Keep your bets sensible and try to grow your starting stake of 100 coins by the end!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceColorBetSettings),
  reducer, isTerminal, 
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "result") return { selector: '[data-testid="hint-target-dice-color-bet-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-color-bet-roll"]', pulses: 3 };
  },
  component: DiceColorBet,
};

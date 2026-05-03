import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCoinFlipState, DiceCoinFlipAction, DiceCoinFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCoinFlipGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCoinFlipGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCoinFlipPlugin: GamePlugin<DiceCoinFlipState, DiceCoinFlipAction, typeof settings> = {
  id:"dice-coin-flip", title:"Dice Coin Flip", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Use a die as a coin: even=heads, odd=tails. 20 flips.",
  howToPlay:`Dice Coin Flip is a 20-round coin-flip simulator using a single six-sided die. Heads is defined as an even result (2, 4, or 6) and Tails as an odd result (1, 3, or 5). The die is fair, so heads/tails are exactly 50/50.

Each round, predict either Heads (Even) or Tails (Odd). Press the matching button. The die rolls, and you see the actual result alongside whether you won. A correct prediction earns 5 points; a wrong one earns nothing.

There's no skill — pure 50/50 luck per flip. Across 20 flips, average totals land at 50 points (the expected value). Lucky streaks can push past 70; unlucky streaks slump below 30. The standard deviation across runs is about 11 points.

Tap Next to advance. The game records every result as you go, so you can track your hot streaks and cold streaks. Trust your gut — or don't, since it makes no statistical difference!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCoinFlipSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-coin-flip-roll"]', pulses: 3 }; },
  component:DiceCoinFlipGame,
};

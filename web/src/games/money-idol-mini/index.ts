import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MoneyIdolMiniState, MoneyIdolMiniAction, MoneyIdolMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MoneyIdolMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MoneyIdolMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const moneyIdolMiniPlugin: GamePlugin<MoneyIdolMiniState, MoneyIdolMiniAction, typeof settings> = {
  id:"money-idol-mini", title:"Money Idol Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Coin-and-cash match-3 with currency exchange theme.",
  howToPlay:"Money Idol Mini is a sixty-second match-three with a fun currency-exchange theme. The six-by-six grid is filled with coins, dollar bills, money bags, yen notes, and euro notes. Click adjacent currencies to swap them. Whenever a swap creates a horizontal or vertical run of three or more matching currencies, they're cleared for ten points each, and new currencies fall in from above — often triggering satisfying cascade chains for big bonus points. Invalid swaps cancel without using a turn. The five-currency palette makes matches happen fast; chain cascades are where serious points live. The clock counts down sixty seconds at the top of the screen. Average runs land near 280-360 points; high-rollers chasing four-in-a-row clears regularly top 500. When the timer expires, your final score locks in. Exchange your way to a fortune — every match is money in the bank!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MoneyIdolMiniSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-money-idol-mini-action"]', pulses: 3 }; }, component:MoneyIdolMiniGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type DayTraderState, type DayTraderAction } from "./state.js";
const DayTraderGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DayTraderGame as unknown as React.ComponentType<unknown> })));
const settings = {
  volatility: {
    kind: "enum" as const,
    label: "Volatility",
    options: ["low", "medium", "high"] as const,
    default: "medium" as const,
  },
} as const;

export const stockDayTraderPlugin: GamePlugin<DayTraderState, DayTraderAction, typeof settings> = {
  id: "stock-day-trader",
  title: "Day Trader",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Buy and sell stocks over 20 trading days — grow $10,000 into a fortune!",
  howToPlay: `Day Trader puts you on the floor of a virtual stock exchange with $10,000 in starting capital. Five fictional stocks — APEX, BOLT, CODA, DUNE, and EDGE — each begin at a random price between $50 and $150.

Each day you can buy or sell shares of any stock in lots of 1 or 5. Click Buy to add shares to your portfolio; click Sell to liquidate them at the current price. When you're done trading for the day, hit Next Day to advance — prices shift randomly based on the volatility setting.

Watch the price indicators: a green triangle means the stock rose since yesterday; red means it fell. Use trends to time your buys and sells. There are no commissions — pure price movement is your challenge.

After 20 trading days the market closes. Your final score is your total net worth — cash plus the market value of all shares you still hold. Low volatility means small, predictable swings; High volatility means big gains and big crashes. Choose wisely and trade smart!`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-stock-day-trader-action"]', pulses: 3 }; },
  component: DayTraderGame,
};

import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { StockTickerState, StockAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StockTicker = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StockTicker as unknown as React.ComponentType<unknown> })));
export const stockTickerPlugin = {
  id: "stock-ticker",
  title: "Stock Ticker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Buy and sell 5 stocks over 30 turns — time the market for maximum profit!",
  howToPlay: `Stock Ticker is a simplified stock-market simulation. You start with $1,000 cash and trade 5 fictional stocks over 30 turns, trying to grow your portfolio as much as possible.

The main table shows each stock's current price, the price change from last turn (green = up, red = down), and how many shares you currently hold. Set the quantity you want to trade in the Qty column, then click Buy to purchase shares or Sell to sell them. You cannot spend more cash than you have, and you cannot sell shares you do not own.

Each time you click "Next Turn," prices shift randomly — each stock moves up or down by up to 10% per turn. There is a slight upward bias built in, but individual stocks can crash or skyrocket unpredictably.

Strategy: Buy stocks that have been falling and look undervalued. Sell when they spike. Diversifying across multiple stocks reduces risk. Watch your cash — you need it to buy opportunities. Try to sell all holdings before the final turn to lock in gains.

After 30 turns the market closes and your score is based on total portfolio value (cash + shares). Doubling your money to $2,000 earns a perfect score. Beat $1,000 for profit!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: StockTickerState, action: StockAction) => StockTickerState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".stock-btn", pulses: 3 }; },
  component: StockTicker,
} as unknown as GamePlugin;

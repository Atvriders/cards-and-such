import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { StockMarketState, StockMarketAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StockMarketMini } from "./Game.js";

export const stockMarketMiniPlugin = {
  id: "stock-market-mini",
  title: "Stock Market Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trade 5 seeded stocks over 30 turns. Start with $1000 — can you double your money?",
  howToPlay: `Stock Market Mini puts you in charge of a $1000 portfolio over 30 trading turns. Five stocks are available: LemonadeCo, FarmCorp, TechEdge, ShipWay, and GoldMine. Each starts at a random seeded price between $10 and $100.

Each turn you can buy or sell any number of shares. Set the quantity using the number input next to each stock, then click Buy or Sell. You cannot buy more shares than your cash allows, and you cannot sell more shares than you hold. All five stocks can be traded freely each turn.

After placing your trades, click "End Turn" to advance prices. Stock prices move each turn based on a seeded random walk with a slight upward bias — but individual stocks can crash or soar. Watch the price arrows (▲ up, ▼ down) to spot trends.

On the final turn (turn 30) all remaining shares are automatically liquidated at current prices, giving you your final cash total.

Strategy tips: Diversify across multiple stocks to reduce risk. Buy low when a stock has fallen several turns in a row, and consider taking profits after a big run-up. Holding one winning stock concentrates both upside and risk. Target $2,000 (doubling your money) for a top score. Watch out for stocks that crash near the end when you cannot recover.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: StockMarketState, action: StockMarketAction) => StockMarketState,
  isTerminal,
  component: StockMarketMini,
} as unknown as GamePlugin;

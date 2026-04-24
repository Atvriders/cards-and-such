import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 30;
export const STARTING_CASH = 1000;

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  history: readonly number[];
}

export interface StockMarketState {
  rngSeed: number;
  turn: number; // 1..30
  cash: number;
  portfolio: readonly number[]; // shares held per stock (5 stocks)
  stocks: readonly Stock[];
  phase: "trading" | "done";
  log: readonly string[];
}

export type StockMarketAction =
  | { type: "buy"; stockIndex: number; shares: number }
  | { type: "sell"; stockIndex: number; shares: number }
  | { type: "endTurn" };

const STOCK_DEFS = [
  { symbol: "LMND", name: "LemonadeCo" },
  { symbol: "FARM", name: "FarmCorp" },
  { symbol: "TECH", name: "TechEdge" },
  { symbol: "SHIP", name: "ShipWay" },
  { symbol: "GOLD", name: "GoldMine" },
];

function nextPrice(current: number, rng: () => number): number {
  const change = (rng() - 0.48) * 0.18; // slight upward bias
  return Math.max(1, Math.round(current * (1 + change) * 100) / 100);
}

export function initialState(seed: number): StockMarketState {
  const rng = mulberry32(seed);
  const stocks: Stock[] = STOCK_DEFS.map(def => {
    const price = Math.round((10 + rng() * 90) * 100) / 100;
    return { ...def, price, history: [price] };
  });
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    turn: 1,
    cash: STARTING_CASH,
    portfolio: [0, 0, 0, 0, 0],
    stocks,
    phase: "trading",
    log: [],
  };
}

export function reducer(state: StockMarketState, action: StockMarketAction): StockMarketState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buy": {
      const { stockIndex, shares } = action;
      if (stockIndex < 0 || stockIndex >= 5 || shares <= 0) return state;
      const stock = state.stocks[stockIndex];
      if (!stock) return state;
      const cost = stock.price * shares;
      if (cost > state.cash) return state;
      const newPortfolio = [...state.portfolio] as number[];
      newPortfolio[stockIndex] = (newPortfolio[stockIndex] ?? 0) + shares;
      return {
        ...state,
        cash: Math.round((state.cash - cost) * 100) / 100,
        portfolio: newPortfolio,
        log: [...state.log, `Bought ${shares}x ${stock.symbol} @ $${stock.price.toFixed(2)}`],
      };
    }

    case "sell": {
      const { stockIndex, shares } = action;
      if (stockIndex < 0 || stockIndex >= 5 || shares <= 0) return state;
      const held = state.portfolio[stockIndex] ?? 0;
      if (shares > held) return state;
      const stock = state.stocks[stockIndex];
      if (!stock) return state;
      const proceeds = stock.price * shares;
      const newPortfolio = [...state.portfolio] as number[];
      newPortfolio[stockIndex] = (newPortfolio[stockIndex] ?? 0) - shares;
      return {
        ...state,
        cash: Math.round((state.cash + proceeds) * 100) / 100,
        portfolio: newPortfolio,
        log: [...state.log, `Sold ${shares}x ${stock.symbol} @ $${stock.price.toFixed(2)}`],
      };
    }

    case "endTurn": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newStocks = state.stocks.map(stock => {
        const price = nextPrice(stock.price, rng);
        return { ...stock, price, history: [...stock.history, price] };
      });
      const nextTurn = state.turn + 1;
      if (nextTurn > TOTAL_TURNS) {
        // Sell everything
        let finalCash = state.cash;
        state.portfolio.forEach((shares, i) => {
          const ns = newStocks[i];
          if (ns) finalCash += ns.price * shares;
        });
        return {
          ...state,
          rngSeed: nextSeed,
          turn: nextTurn,
          stocks: newStocks,
          cash: Math.round(finalCash * 100) / 100,
          portfolio: [0, 0, 0, 0, 0],
          phase: "done",
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        turn: nextTurn,
        stocks: newStocks,
      };
    }
  }
}

export function portfolioValue(state: StockMarketState): number {
  return Math.round(
    state.portfolio.reduce((sum, shares, i) => sum + shares * (state.stocks[i]?.price ?? 0), 0) * 100,
  ) / 100;
}

export function totalValue(state: StockMarketState): number {
  return Math.round((state.cash + portfolioValue(state)) * 100) / 100;
}

export function isTerminal(state: StockMarketState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: 0-100 based on final value, target 2x starting ($2000)
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 2000) * 100))) };
}

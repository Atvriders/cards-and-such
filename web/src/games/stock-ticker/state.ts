import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const NUM_STOCKS = 5;
export const TOTAL_TURNS = 30;
export const START_CASH = 1000; // dollars

export const STOCK_NAMES = ["AlphaCorp", "BetaTech", "GammaCo", "DeltaFin", "EpsilonRx"] as const;

export interface StockTickerState {
  rngSeed: number;
  turn: number;
  cash: number;
  prices: readonly number[]; // current price per share (dollars)
  shares: readonly number[]; // shares held
  history: readonly (readonly number[])[]; // price history per stock
  phase: "trading" | "ticked" | "done";
  lastMsg: string;
}

export type StockAction =
  | { type: "buy"; stock: number; qty: number }
  | { type: "sell"; stock: number; qty: number }
  | { type: "tick" }; // advance one turn

function clampPrice(p: number): number {
  return Math.max(1, Math.min(500, Math.round(p * 100) / 100));
}

function tickPrices(prices: readonly number[], rng: () => number): number[] {
  return prices.map(p => {
    const pct = (rng() - 0.48) * 0.2; // -9.6% to +10.4% per turn
    return clampPrice(p * (1 + pct));
  });
}

export function initialState(seed: number): StockTickerState {
  const rng = mulberry32(seed);
  const prices = Array.from({ length: NUM_STOCKS }, () => 50 + Math.round(rng() * 100));
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    turn: 0,
    cash: START_CASH,
    prices,
    shares: new Array(NUM_STOCKS).fill(0),
    history: prices.map(p => [p]),
    phase: "trading",
    lastMsg: "Market opens! Buy low, sell high over 30 turns.",
  };
}

export function reducer(state: StockTickerState, action: StockAction): StockTickerState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "buy": {
      const { stock, qty } = action;
      if (stock < 0 || stock >= NUM_STOCKS || qty <= 0) return state;
      const cost = state.prices[stock]! * qty;
      if (cost > state.cash) return { ...state, lastMsg: "Not enough cash!" };
      const shares = [...state.shares];
      shares[stock] = (shares[stock] ?? 0) + qty;
      return {
        ...state,
        cash: Math.round((state.cash - cost) * 100) / 100,
        shares,
        lastMsg: `Bought ${qty} × ${STOCK_NAMES[stock]} @ $${state.prices[stock]?.toFixed(2)}`,
      };
    }

    case "sell": {
      const { stock, qty } = action;
      if (stock < 0 || stock >= NUM_STOCKS || qty <= 0) return state;
      const held = state.shares[stock] ?? 0;
      if (qty > held) return { ...state, lastMsg: "Not enough shares!" };
      const proceeds = state.prices[stock]! * qty;
      const shares = [...state.shares];
      shares[stock] = held - qty;
      return {
        ...state,
        cash: Math.round((state.cash + proceeds) * 100) / 100,
        shares,
        lastMsg: `Sold ${qty} × ${STOCK_NAMES[stock]} @ $${state.prices[stock]?.toFixed(2)}`,
      };
    }

    case "tick": {
      if (state.phase !== "trading") return state;
      const rng = mulberry32(state.rngSeed);
      const newPrices = tickPrices(state.prices, rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newTurn = state.turn + 1;
      const newHistory = state.history.map((h, i) => [...h, newPrices[i]!]);
      const phase = newTurn >= TOTAL_TURNS ? "done" : "trading";
      return {
        ...state,
        rngSeed: nextSeed,
        turn: newTurn,
        prices: newPrices,
        history: newHistory,
        phase,
        lastMsg: newTurn >= TOTAL_TURNS ? "Market closed! Final results." : `Turn ${newTurn}: prices updated.`,
      };
    }
  }
}

export function portfolioValue(state: StockTickerState): number {
  return state.shares.reduce((sum, sh, i) => sum + sh * (state.prices[i] ?? 0), 0);
}

export function isTerminal(state: StockTickerState): { score: number } | null {
  if (state.phase !== "done") return null;
  const total = state.cash + portfolioValue(state);
  // Score: 0-100, $1000 = 50, $2000 = 100, <$1000 proportional
  const score = Math.max(0, Math.min(100, Math.round((total / START_CASH) * 50)));
  return { score };
}

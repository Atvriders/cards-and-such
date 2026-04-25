import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DayTraderSettings {
  volatility: "low" | "medium" | "high";
}

export interface Stock {
  ticker: string;
  price: number;
  shares: number;
}

export interface DayTraderState {
  settings: DayTraderSettings;
  rng: () => number;
  day: number;
  maxDays: number;
  cash: number;
  portfolio: Stock[];
  history: Record<string, number[]>;
  score: number;
  over: boolean;
  log: string;
}

export type DayTraderAction =
  | { type: "buy"; ticker: string; qty: number }
  | { type: "sell"; ticker: string; qty: number }
  | { type: "next-day" };

const TICKERS = ["APEX", "BOLT", "CODA", "DUNE", "EDGE"];

function volatilityFactor(v: string): number {
  return v === "low" ? 0.03 : v === "high" ? 0.12 : 0.07;
}

function priceMove(rng: () => number, vol: number): number {
  return 1 + (rng() * 2 - 1) * vol;
}

export function initialState(seed: number, settings: DayTraderSettings): DayTraderState {
  const rng = mulberry32(seed);
  const portfolio: Stock[] = TICKERS.map(t => ({
    ticker: t,
    price: 50 + Math.round(rng() * 100),
    shares: 0,
  }));
  const history: Record<string, number[]> = {};
  for (const s of portfolio) history[s.ticker] = [s.price];
  return {
    settings,
    rng,
    day: 1,
    maxDays: 20,
    cash: 10000,
    portfolio,
    history,
    score: 0,
    over: false,
    log: "Day 1: Market open! Buy low, sell high!",
  };
}

export function reducer(state: DayTraderState, action: DayTraderAction): DayTraderState {
  if (state.over) return state;

  if (action.type === "buy") {
    const stock = state.portfolio.find(s => s.ticker === action.ticker);
    if (!stock) return state;
    const cost = stock.price * action.qty;
    if (cost > state.cash) return { ...state, log: `Not enough cash to buy ${action.qty} ${action.ticker}.` };
    const portfolio = state.portfolio.map(s =>
      s.ticker === action.ticker ? { ...s, shares: s.shares + action.qty } : s
    );
    return {
      ...state,
      cash: Math.round((state.cash - cost) * 100) / 100,
      portfolio,
      log: `Bought ${action.qty} shares of ${action.ticker} at $${stock.price}.`,
    };
  }

  if (action.type === "sell") {
    const stock = state.portfolio.find(s => s.ticker === action.ticker);
    if (!stock || stock.shares < action.qty) {
      return { ...state, log: `You don't own ${action.qty} shares of ${action.ticker}.` };
    }
    const proceeds = stock.price * action.qty;
    const portfolio = state.portfolio.map(s =>
      s.ticker === action.ticker ? { ...s, shares: s.shares - action.qty } : s
    );
    return {
      ...state,
      cash: Math.round((state.cash + proceeds) * 100) / 100,
      portfolio,
      log: `Sold ${action.qty} shares of ${action.ticker} at $${stock.price}. +$${proceeds}.`,
    };
  }

  if (action.type === "next-day") {
    const vol = volatilityFactor(state.settings.volatility);
    const portfolio = state.portfolio.map(s => {
      const newPrice = Math.max(1, Math.round(s.price * priceMove(state.rng, vol) * 100) / 100);
      return { ...s, price: newPrice };
    });
    const history = { ...state.history };
    for (const s of portfolio) {
      history[s.ticker] = [...(history[s.ticker] ?? []), s.price];
    }

    const day = state.day + 1;
    const over = day > state.maxDays;
    const portfolioValue = portfolio.reduce((sum, s) => sum + s.price * s.shares, 0);
    const totalWorth = state.cash + portfolioValue;
    const score = over ? Math.round(totalWorth) : 0;
    const log = over
      ? `Market closed! Net worth: $${Math.round(totalWorth)}. Score: ${score}.`
      : `Day ${day}: Prices updated. Net worth: $${Math.round(totalWorth)}.`;

    return { ...state, day, portfolio, history, over, score, log };
  }

  return state;
}

export function isTerminal(state: DayTraderState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

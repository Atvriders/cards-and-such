import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;
export const ASSET_COST = 35;
export const HIRE_COST = 55;

export interface StockpileTraderSettings { dummy: boolean; }
export interface StockpileTraderState {
  rngSeed: number;
  turn: number;
  cash: number;
  assets: number;
  workers: number;
  lastEvent: string | null;
  lastDelta: number;
  phase: "choosing" | "resolved" | "done";
}
export type StockpileTraderAction = { type: "invest" } | { type: "save" } | { type: "hire" } | { type: "trade" } | { type: "next" };

export function initialState(seed: number, _s: StockpileTraderSettings): StockpileTraderState {
  return { rngSeed: seed, turn: 1, cash: 200, assets: 0, workers: 0, lastEvent: null, lastDelta: 0, phase: "choosing" };
}

const EVENT_LINES = ["Market shift","Demand spike","Supply glut","Trade pact","Toll levy","Tax break","Boom day","Slow day"];

export function reducer(state: StockpileTraderState, action: StockpileTraderAction): StockpileTraderState {
  if (state.phase === "done") return state;
  if (state.phase === "choosing") {
    const rng = mulberry32(state.rngSeed);
    const r = rng();
    const ev = Math.floor(rng() * EVENT_LINES.length);
    const next = Math.floor(rng() * 2 ** 31);
    let cash = state.cash, assets = state.assets, workers = state.workers, evt = "", delta = 0;
    if (action.type === "invest") {
      if (cash >= ASSET_COST) {
        cash -= ASSET_COST; assets += 1; evt = "Bought 1 asset (-$" + ASSET_COST + ")"; delta = -ASSET_COST;
      } else { evt = "Not enough cash to invest"; }
    } else if (action.type === "save") {
      const interest = Math.floor(cash * 0.05);
      cash += interest; evt = "Saved (+$" + interest + " interest)"; delta = interest;
    } else if (action.type === "hire") {
      if (cash >= HIRE_COST) {
        cash -= HIRE_COST; workers += 1; evt = "Hired worker (-$" + HIRE_COST + ")"; delta = -HIRE_COST;
      } else { evt = "Not enough cash to hire"; }
    } else if (action.type === "trade") {
      if (assets >= 1) {
        const market = 25 + Math.floor(r * 21);
        cash += market; assets -= 1; evt = "Sold 1 asset (+$" + market + ")"; delta = market;
      } else { evt = "No asset to sell"; }
    } else { return state; }
    const div = assets * Math.max(1, Math.floor(35 * 0.18));
    cash += div;
    const pay = workers * Math.max(1, Math.floor(55 * 0.18));
    cash += pay;
    const flavor = EVENT_LINES[ev % EVENT_LINES.length] || "";
    if (div > 0) evt += " | Yield +$" + div;
    if (pay > 0) evt += " | Worker earned +$" + pay;
    if (flavor) evt += " | " + flavor;
    delta += div + pay;
    const isLast = state.turn >= TOTAL_TURNS;
    return { ...state, rngSeed: next, cash, assets, workers, lastEvent: evt, lastDelta: delta, phase: isLast ? "done" : "resolved" };
  }
  if (action.type === "next" && state.phase === "resolved") {
    return { ...state, turn: state.turn + 1, phase: "choosing", lastEvent: null, lastDelta: 0 };
  }
  return state;
}

export function score(s: StockpileTraderState): number {
  const net = s.cash + s.assets * ASSET_COST + s.workers * HIRE_COST;
  return Math.max(0, net);
}
export function isTerminal(s: StockpileTraderState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

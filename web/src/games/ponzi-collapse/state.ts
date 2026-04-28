import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;
export const ASSET_COST = 40;
export const HIRE_COST = 70;

export interface PonziCollapseSettings { dummy: boolean; }
export interface PonziCollapseState {
  rngSeed: number;
  turn: number;
  cash: number;
  assets: number;
  workers: number;
  lastEvent: string | null;
  lastDelta: number;
  phase: "choosing" | "resolved" | "done";
}
export type PonziCollapseAction = { type: "invest" } | { type: "save" } | { type: "hire" } | { type: "trade" } | { type: "next" };

export function initialState(seed: number, _s: PonziCollapseSettings): PonziCollapseState {
  return { rngSeed: seed, turn: 1, cash: 200, assets: 0, workers: 0, lastEvent: null, lastDelta: 0, phase: "choosing" };
}

const EVENT_LINES = ["Regulator warning","Big payout demand","New investor recruited","Whistleblower rumor","Ponzi alarm bells","Liquidation panic"];

export function reducer(state: PonziCollapseState, action: PonziCollapseAction): PonziCollapseState {
  if (state.phase === "done") return state;
  if (state.phase === "choosing") {
    const rng = mulberry32(state.rngSeed);
    const r = rng();
    const ev = Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    let cash = state.cash, assets = state.assets, workers = state.workers, evt = "", delta = 0;
    if (action.type === "invest") {
      if (cash >= ASSET_COST) {
        cash -= ASSET_COST; assets += 1; evt = "Bought 1 Investors (-$" + ASSET_COST + ")"; delta = -ASSET_COST;
      } else { evt = "Not enough cash to invest"; }
    } else if (action.type === "save") {
      const interest = Math.floor(cash * 0.05);
      cash += interest; evt = "Saved at bank (+$" + interest + " interest)"; delta = interest;
    } else if (action.type === "hire") {
      if (cash >= HIRE_COST) {
        cash -= HIRE_COST; workers += 1; evt = "Hired Recruiter (-$" + HIRE_COST + ")"; delta = -HIRE_COST;
      } else { evt = "Not enough cash to hire"; }
    } else if (action.type === "trade") {
      if (assets >= 1) {
        const market = 30 + Math.floor(r * 20);
        cash += market; assets -= 1; evt = "Traded 1 Investors (+$" + market + ")"; delta = market;
      } else { evt = "No Investors to trade"; }
    } else { return state; }
    const div = assets * 10;
    cash += div;
    const pay = workers * 16;
    cash += pay;
    const flavor = EVENT_LINES.length > 0 ? EVENT_LINES[ev % EVENT_LINES.length] : "";
    if (div > 0) evt += " | Dividends +$" + div;
    if (pay > 0) evt += " | Workers earned +$" + pay;
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

export function score(s: PonziCollapseState): number {
  const net = s.cash + s.assets * ASSET_COST + s.workers * HIRE_COST;
  return Math.max(0, net);
}
export function isTerminal(s: PonziCollapseState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 4;
export const TOTAL_TURNS = 16;
export const BUDGET = 100;

type ShopKind = "deal" | "splurge" | "fair" | "freebie" | "dud";
export interface Shop { kind: ShopKind; price: number; label: string; }
export const MALL: Shop[] = [
  { kind: "deal", price: 5, label: "Outlet Tee" },
  { kind: "fair", price: 12, label: "Bookstore" },
  { kind: "splurge", price: 30, label: "Boutique" },
  { kind: "deal", price: 8, label: "Snacks" },
  { kind: "freebie", price: 0, label: "Sample" },
  { kind: "fair", price: 15, label: "Tech Shop" },
  { kind: "dud", price: 25, label: "Sock Stand" },
  { kind: "splurge", price: 40, label: "Watch Store" },
  { kind: "deal", price: 6, label: "Toy Aisle" },
  { kind: "fair", price: 18, label: "Coffee Stand" },
  { kind: "freebie", price: 0, label: "Free Sample" },
  { kind: "splurge", price: 35, label: "Designer" },
  { kind: "fair", price: 10, label: "Gift Shop" },
  { kind: "deal", price: 7, label: "Discount Bin" },
  { kind: "dud", price: 20, label: "Touristy" },
  { kind: "fair", price: 14, label: "Hat Cart" },
];

export interface MallSettings { dummy: boolean; }
export interface MallState {
  rngSeed: number;
  pos: number; // 0..15 in 4x4 grid
  budget: number;
  items: number;
  turn: number;
  lastRoll: number | null;
  lastShop: number;
  phase: "rolling" | "deciding" | "done";
}
export type MallAction = { type: "roll" } | { type: "buy" } | { type: "skip" };

export function initialState(seed: number, _s: MallSettings): MallState {
  return { rngSeed: seed, pos: 0, budget: BUDGET, items: 0, turn: 1, lastRoll: null, lastShop: 0, phase: "rolling" };
}

export function reducer(state: MallState, action: MallAction): MallState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pos = (state.pos + r) % MALL.length;
    return { ...state, rngSeed: nextSeed, pos, lastRoll: r, lastShop: pos, phase: "deciding" };
  }
  if (state.phase === "deciding") {
    const shop = MALL[state.lastShop]!;
    if (action.type === "buy") {
      const canAfford = state.budget >= shop.price;
      const newBudget = canAfford ? state.budget - shop.price : state.budget;
      const itemsGained = canAfford ? (shop.kind === "freebie" ? 1 : shop.kind === "dud" ? 0 : shop.kind === "splurge" ? 1 : shop.kind === "deal" ? 2 : 1) : 0;
      const items = state.items + itemsGained;
      const isLast = state.turn >= TOTAL_TURNS;
      return { ...state, budget: newBudget, items, turn: state.turn + 1, phase: isLast ? "done" : "rolling", lastRoll: null };
    }
    if (action.type === "skip") {
      const isLast = state.turn >= TOTAL_TURNS;
      return { ...state, turn: state.turn + 1, phase: isLast ? "done" : "rolling", lastRoll: null };
    }
  }
  return state;
}

export function score(s: MallState): number { return s.items * 20 + Math.max(0, s.budget); }
export function isTerminal(s: MallState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

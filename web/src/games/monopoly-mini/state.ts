import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const BOARD_LEN = 8;
export const MAX_TURNS = 20;

// 8 squares: 0 GO (free), 1-2 cheap, 3 free, 4 medium, 5 medium, 6 free, 7 expensive
export const PRICES = [0, 60, 80, 0, 120, 140, 0, 200];
export const RENTS  = [0, 15, 20, 0, 35,  40,  0, 60];

export type Owner = "none" | "p" | "c";

export interface MonopolySettings { dummy: boolean; }
export interface MonopolyState {
  rngSeed: number;
  pPos: number; cPos: number;
  pCash: number; cCash: number;
  owners: Owner[];
  turn: number;
  isPlayer: boolean; // whose turn
  phase: "rolling" | "deciding" | "ai" | "done";
  lastRoll: number | null;
  message: string;
}
export type MonopolyAction = { type: "roll" } | { type: "buy" } | { type: "skip" } | { type: "ai" };

export function initialState(seed: number, _s: MonopolySettings): MonopolyState {
  return { rngSeed: seed, pPos: 0, cPos: 0, pCash: 500, cCash: 500, owners: new Array(BOARD_LEN).fill("none"), turn: 1, isPlayer: true, lastRoll: null, phase: "rolling", message: "Your move" };
}

function bankrupt(s: MonopolyState): "p" | "c" | null {
  if (s.pCash < 0) return "p";
  if (s.cCash < 0) return "c";
  return null;
}

export function reducer(state: MonopolyState, action: MonopolyAction): MonopolyState {
  if (state.phase === "done") return state;
  // Player roll
  if (action.type === "roll" && state.phase === "rolling" && state.isPlayer) {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pPos = (state.pPos + r) % BOARD_LEN;
    const owner = state.owners[pPos]!;
    const price = PRICES[pPos]!;
    const rent = RENTS[pPos]!;
    let pCash = state.pCash, cCash = state.cCash, msg = "";
    if (owner === "c") { pCash -= rent; cCash += rent; msg = `Rent ${rent} to CPU.`; }
    else if (owner === "p") { msg = "Your property."; }
    let next: MonopolyState = { ...state, rngSeed: nextSeed, pPos, pCash, cCash, lastRoll: r, message: msg };
    if (owner === "none" && price > 0) next = { ...next, phase: "deciding", message: `Square ${pPos}: buy for $${price}?` };
    else next = { ...next, phase: "ai" };
    const b = bankrupt(next); if (b) return { ...next, phase: "done", message: b === "p" ? "You bankrupt!" : "CPU bankrupt!" };
    return next;
  }
  if (action.type === "buy" && state.phase === "deciding" && state.isPlayer) {
    const price = PRICES[state.pPos]!;
    if (state.pCash < price) return { ...state, phase: "ai", message: "Cannot afford." };
    const owners = state.owners.slice(); owners[state.pPos] = "p";
    return { ...state, pCash: state.pCash - price, owners, phase: "ai", message: `Bought for $${price}.` };
  }
  if (action.type === "skip" && state.phase === "deciding" && state.isPlayer) {
    return { ...state, phase: "ai", message: "Skipped." };
  }
  // AI turn
  if (action.type === "ai" && state.phase === "ai") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const cPos = (state.cPos + r) % BOARD_LEN;
    const owner = state.owners[cPos]!;
    const price = PRICES[cPos]!;
    const rent = RENTS[cPos]!;
    let pCash = state.pCash, cCash = state.cCash, owners = state.owners, msg = `CPU rolled ${r} -> ${cPos}.`;
    if (owner === "p") { cCash -= rent; pCash += rent; msg += ` Pays you ${rent}.`; }
    else if (owner === "none" && price > 0 && cCash >= price) {
      // CPU greedy: buy if can afford
      const o = state.owners.slice(); o[cPos] = "c";
      cCash -= price; owners = o; msg += ` CPU buys for $${price}.`;
    }
    let next: MonopolyState = { ...state, rngSeed: nextSeed, cPos, pCash, cCash, owners, isPlayer: true, turn: state.turn + 1, phase: "rolling", message: msg };
    const b = bankrupt(next); if (b) return { ...next, phase: "done", message: b === "p" ? "You bankrupt!" : "CPU bankrupt!" };
    if (next.turn > MAX_TURNS) {
      const winner = next.pCash > next.cCash ? "You win!" : next.pCash < next.cCash ? "CPU wins." : "Tie.";
      return { ...next, phase: "done", message: winner };
    }
    return next;
  }
  return state;
}

export function score(s: MonopolyState): number {
  // Final score: cash - opponent cash, with bonus for win
  const win = s.message.startsWith("You win") || s.message.startsWith("CPU bankrupt") ? 500 : 0;
  return Math.max(0, win + s.pCash - s.cCash + 500);
}
export function isTerminal(s: MonopolyState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

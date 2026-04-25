import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const STARTING_CREDITS = 100;
export const MAX_SPINS = 30;

export type Symbol = "cherry" | "lemon" | "orange" | "bell" | "bar" | "seven" | "wild";

export interface SlotResult {
  reels: [Symbol, Symbol, Symbol];
  payout: number;
  line: string;
}

export interface SlotMachineProState {
  rngSeed: number;
  credits: number;
  bet: number;
  spinsLeft: number;
  lastResult: SlotResult | null;
  jackpotPool: number;
  phase: "idle" | "done";
  log: readonly string[];
}

export type SlotAction =
  | { type: "setBet"; amount: number }
  | { type: "spin" };

const SYMBOLS: Symbol[] = ["cherry", "lemon", "orange", "bell", "bar", "seven", "wild"];

// Weights: higher index = rarer
const WEIGHTS = [30, 25, 20, 12, 8, 3, 2]; // total ~100

function weightedPick(rng: () => number): Symbol {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= (WEIGHTS[i] ?? 0);
    if (r <= 0) return SYMBOLS[i] ?? "cherry";
  }
  return SYMBOLS[SYMBOLS.length - 1] ?? "cherry";
}

export function calcPayout(reels: [Symbol, Symbol, Symbol], bet: number, jackpot: number): { payout: number; line: string } {
  const [a, b, c] = reels;

  // Jackpot
  if (a === "seven" && b === "seven" && c === "seven") {
    return { payout: jackpot + bet * 50, line: "JACKPOT! 7-7-7!" };
  }
  // Three of a kind
  if (a === b && b === c) {
    const mult: Record<Symbol, number> = { cherry: 5, lemon: 6, orange: 8, bell: 12, bar: 20, seven: 50, wild: 30 };
    return { payout: bet * mult[a], line: `Three ${a}s! x${mult[a]}` };
  }
  // Wild substitutions
  const effective = [a, b, c].map(s => s === "wild" ? null : s);
  const nonWild = effective.filter(Boolean);
  if (nonWild.length > 0 && nonWild.every(s => s === nonWild[0])) {
    const sym = nonWild[0] as Symbol;
    const mult: Record<Symbol, number> = { cherry: 4, lemon: 5, orange: 6, bell: 9, bar: 14, seven: 30, wild: 20 };
    return { payout: bet * mult[sym], line: `Wild ${sym} combo! x${mult[sym]}` };
  }
  // Two of a kind
  if (a === b || b === c || a === c) {
    const match = a === b ? a : (b === c ? b : a);
    if (match === "bar" || match === "seven" || match === "bell") {
      return { payout: bet * 2, line: `Pair of ${match}s. x2` };
    }
  }
  // Any cherry
  if (a === "cherry" || b === "cherry" || c === "cherry") {
    return { payout: bet, line: "Cherry! x1 (break even)" };
  }
  return { payout: 0, line: "No match." };
}

export function initialState(seed: number): SlotMachineProState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    credits: STARTING_CREDITS,
    bet: 5,
    spinsLeft: MAX_SPINS,
    lastResult: null,
    jackpotPool: 200,
    phase: "idle",
    log: [],
  };
}

export function reducer(state: SlotMachineProState, action: SlotAction): SlotMachineProState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setBet": {
      const bet = Math.max(1, Math.min(20, action.amount));
      return { ...state, bet };
    }

    case "spin": {
      if (state.credits < state.bet || state.spinsLeft <= 0) return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const reels: [Symbol, Symbol, Symbol] = [weightedPick(rng), weightedPick(rng), weightedPick(rng)];
      const newJackpot = state.jackpotPool + Math.floor(state.bet * 0.1);
      const { payout, line } = calcPayout(reels, state.bet, newJackpot);
      const usedJackpot = line.includes("JACKPOT");
      const newCredits = state.credits - state.bet + payout;
      const newSpins = state.spinsLeft - 1;
      const jackpotPool = usedJackpot ? 200 : newJackpot;
      const done = newSpins <= 0 || newCredits <= 0;
      const logLine = `Spin ${MAX_SPINS - newSpins}: ${reels.join("-")} → ${line} (${payout > 0 ? "+" : ""}${payout - state.bet})`;
      return {
        ...state,
        rngSeed: nextSeed,
        credits: Math.max(0, newCredits),
        spinsLeft: newSpins,
        lastResult: { reels, payout, line },
        jackpotPool,
        phase: done ? "done" : "idle",
        log: [...state.log, logLine],
      };
    }
  }
}

export function isTerminal(state: SlotMachineProState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.credits / (STARTING_CREDITS * 2)) * 100))) };
}

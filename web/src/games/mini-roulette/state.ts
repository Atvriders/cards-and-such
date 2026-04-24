import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MiniRouletteSettings {
  spinsPerSession: number;
  chipValue: "5" | "10" | "25";
}

export type MiniRoulettePhase = "betting" | "spinning" | "settled";

export type BetType = "straight" | "split" | "color" | "even-odd" | "column";

export interface Bet {
  type: BetType;
  numbers: number[]; // which numbers this bet covers
  amount: number;
}

export interface MiniRouletteState {
  settings: MiniRouletteSettings;
  rngSeed: number;
  bankroll: number;
  spinsPlayed: number;
  phase: MiniRoulettePhase;
  bets: Bet[];
  landedNumber: number | null;
  lastResult: string;
}

export type MiniRouletteAction =
  | { type: "place-bet"; betType: BetType; numbers: number[] }
  | { type: "clear-bets" }
  | { type: "spin" };

// Mini roulette: numbers 0-12 (13 numbers)
// 0 is green. 1,3,5,7,9,11 are red. 2,4,6,8,10,12 are black.
export const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 11]);
export const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 12]);

// Columns (rows of 3, excluding 0): [1,2,3], [4,5,6], [7,8,9], [10,11,12]
export const COLUMNS = [[1,2,3],[4,5,6],[7,8,9],[10,11,12]];

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function payoutForBet(bet: Bet, landed: number): number {
  if (!bet.numbers.includes(landed)) return 0;
  switch (bet.type) {
    case "straight": return bet.amount * 11; // 11:1 on 13-number wheel
    case "split": return bet.amount * 5;     // 5:1
    case "color": return bet.amount * 1;     // 1:1 (even money)
    case "even-odd": return bet.amount * 1;  // 1:1
    case "column": return bet.amount * 2;   // 2:1
    default: return 0;
  }
}

export function initialState(seed: number, settings: MiniRouletteSettings): MiniRouletteState {
  const { nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, spinsPlayed: 0,
    phase: "betting", bets: [], landedNumber: null, lastResult: "",
  };
}

export function reducer(state: MiniRouletteState, action: MiniRouletteAction): MiniRouletteState {
  const chip = parseInt(state.settings.chipValue, 10);
  switch (action.type) {
    case "place-bet": {
      if (state.phase !== "betting") return state;
      if (state.bankroll < chip) return state;
      const newBet: Bet = { type: action.betType, numbers: action.numbers, amount: chip };
      return {
        ...state,
        bankroll: state.bankroll - chip,
        bets: [...state.bets, newBet],
      };
    }
    case "clear-bets": {
      if (state.phase !== "betting") return state;
      const refund = state.bets.reduce((s, b) => s + b.amount, 0);
      return { ...state, bankroll: state.bankroll + refund, bets: [] };
    }
    case "spin": {
      if (state.phase !== "betting") return state;
      if (state.bets.length === 0) return state;
      if (state.spinsPlayed >= state.settings.spinsPerSession) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const landed = Math.floor(rng() * 13); // 0-12
      let winnings = 0;
      const parts: string[] = [];
      for (const bet of state.bets) {
        const payout = payoutForBet(bet, landed);
        winnings += payout;
        if (payout > 0) parts.push(`+$${payout}`);
      }
      const totalWagered = state.bets.reduce((s, b) => s + b.amount, 0);
      if (winnings === 0) parts.push(`Lost $${totalWagered}`);
      return {
        ...state, rngSeed: nextSeed,
        bankroll: state.bankroll + winnings,
        spinsPlayed: state.spinsPlayed + 1,
        phase: "settled",
        landedNumber: landed,
        lastResult: `${landed} (${landed === 0 ? "Green" : RED_NUMBERS.has(landed) ? "Red" : "Black"}) — ${parts.join(", ")}`,
        bets: [],
      };
    }
    default: return state;
  }
}

export function isTerminal(state: MiniRouletteState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.spinsPlayed >= state.settings.spinsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}

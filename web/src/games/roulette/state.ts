import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RouletteSettings {
  maxSpins: "10" | "25" | "50";
}

export type BetType =
  | "straight"
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "dozen1"
  | "dozen2"
  | "dozen3"
  | "col1"
  | "col2"
  | "col3";

export interface PlacedBet {
  type: BetType;
  number?: number; // only for straight bets
  amount: number;
}

export type RoulettePhase = "betting" | "spinning" | "settled";

export interface RouletteState {
  settings: RouletteSettings;
  rngSeed: number;
  bankroll: number;
  spinsPlayed: number;
  phase: RoulettePhase;
  currentBets: PlacedBet[];
  lastNumber: number | null; // 0–37 where 37 = "00"
  lastResult: string;
  pendingBetType: BetType;
  pendingBetAmount: number;
  pendingStraightNumber: number;
}

export type RouletteAction =
  | { type: "set-bet-type"; betType: BetType }
  | { type: "set-bet-amount"; amount: number }
  | { type: "set-straight-number"; num: number }
  | { type: "place-bet" }
  | { type: "clear-bets" }
  | { type: "spin" };

// American roulette: 0, 00 (37), 1-36
// Colors: 0 & 00 = green, red/black alternating per standard layout
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export function getColor(n: number): "green" | "red" | "black" {
  if (n === 0 || n === 37) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

export function displayNumber(n: number): string {
  return n === 37 ? "00" : String(n);
}

/** Returns column 1/2/3 for numbers 1-36, or 0 for 0 and 00 */
function getColumn(n: number): number {
  if (n === 0 || n === 37) return 0;
  return ((n - 1) % 3) + 1;
}

/** Returns dozen 1/2/3 for numbers 1-36, or 0 */
function getDozen(n: number): number {
  if (n === 0 || n === 37) return 0;
  if (n <= 12) return 1;
  if (n <= 24) return 2;
  return 3;
}

export function evaluateBet(bet: PlacedBet, result: number): number {
  const color = getColor(result);
  const isZero = result === 0 || result === 37;

  switch (bet.type) {
    case "straight":
      if (bet.number === result) return bet.amount * 35;
      return -bet.amount;
    case "red":
      if (color === "red") return bet.amount;
      return -bet.amount;
    case "black":
      if (color === "black") return bet.amount;
      return -bet.amount;
    case "odd":
      if (!isZero && result % 2 === 1) return bet.amount;
      return -bet.amount;
    case "even":
      if (!isZero && result % 2 === 0) return bet.amount;
      return -bet.amount;
    case "low":
      if (!isZero && result >= 1 && result <= 18) return bet.amount;
      return -bet.amount;
    case "high":
      if (!isZero && result >= 19 && result <= 36) return bet.amount;
      return -bet.amount;
    case "dozen1":
      if (getDozen(result) === 1) return bet.amount * 2;
      return -bet.amount;
    case "dozen2":
      if (getDozen(result) === 2) return bet.amount * 2;
      return -bet.amount;
    case "dozen3":
      if (getDozen(result) === 3) return bet.amount * 2;
      return -bet.amount;
    case "col1":
      if (getColumn(result) === 1) return bet.amount * 2;
      return -bet.amount;
    case "col2":
      if (getColumn(result) === 2) return bet.amount * 2;
      return -bet.amount;
    case "col3":
      if (getColumn(result) === 3) return bet.amount * 2;
      return -bet.amount;
    default:
      return 0;
  }
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function initialState(seed: number, settings: RouletteSettings): RouletteState {
  return {
    settings,
    rngSeed: seed,
    bankroll: 1000,
    spinsPlayed: 0,
    phase: "betting",
    currentBets: [],
    lastNumber: null,
    lastResult: "",
    pendingBetType: "red",
    pendingBetAmount: 10,
    pendingStraightNumber: 7,
  };
}

export function reducer(state: RouletteState, action: RouletteAction): RouletteState {
  switch (action.type) {
    case "set-bet-type":
      return { ...state, pendingBetType: action.betType };
    case "set-bet-amount":
      return { ...state, pendingBetAmount: action.amount };
    case "set-straight-number":
      return { ...state, pendingStraightNumber: action.num };
    case "place-bet": {
      if (state.phase !== "betting") return state;
      const amount = state.pendingBetAmount;
      if (amount <= 0 || amount > state.bankroll) return state;
      // Check total bets don't exceed bankroll
      const totalBets = state.currentBets.reduce((s, b) => s + b.amount, 0);
      if (totalBets + amount > state.bankroll) return state;
      const newBet: PlacedBet = {
        type: state.pendingBetType,
        amount,
        ...(state.pendingBetType === "straight" ? { number: state.pendingStraightNumber } : {}),
      };
      return { ...state, currentBets: [...state.currentBets, newBet] };
    }
    case "clear-bets":
      return { ...state, currentBets: [] };
    case "spin": {
      if (state.phase !== "betting") return state;
      if (state.currentBets.length === 0) return state;
      const maxSpins = parseInt(state.settings.maxSpins, 10);
      if (state.spinsPlayed >= maxSpins) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // 38 slots: 0–36 (0 and 1–36), plus 37 = "00"
      const result = Math.floor(rng() * 38);

      let netChange = 0;
      const resultParts: string[] = [];

      for (const bet of state.currentBets) {
        const gain = evaluateBet(bet, result);
        netChange += gain;
        if (gain > 0) {
          resultParts.push(`${bet.type} +$${gain}`);
        } else {
          resultParts.push(`${bet.type} -$${bet.amount}`);
        }
      }

      const bankroll = state.bankroll + netChange;
      const resultMsg = `${displayNumber(result)} (${getColor(result)}): ${resultParts.join(", ")}`;

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankroll),
        spinsPlayed: state.spinsPlayed + 1,
        phase: "settled",
        lastNumber: result,
        lastResult: resultMsg,
        currentBets: [],
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RouletteState): { score: number } | null {
  const maxSpins = parseInt(state.settings.maxSpins, 10);
  if (state.phase === "settled" && (state.spinsPlayed >= maxSpins || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}

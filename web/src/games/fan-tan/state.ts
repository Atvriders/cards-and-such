import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FanTanSettings {
  roundsPerSession: number;
  bet: "5" | "10" | "25";
}

export type FanTanPhase = "betting" | "revealing" | "settled";

export type FanTanBet = 1 | 2 | 3 | 4;

export interface FanTanState {
  settings: FanTanSettings;
  rngSeed: number;
  bankroll: number;
  roundsPlayed: number;
  phase: FanTanPhase;
  bets: FanTanBet[];      // numbers bet on (1, 2, 3, or 4)
  result: number | null;  // 1-4 (remainder when dividing bean count by 4)
  beanCount: number | null;
  lastResult: string;
}

export type FanTanAction =
  | { type: "place-bet"; on: FanTanBet }
  | { type: "remove-bet"; on: FanTanBet }
  | { type: "reveal" }
  | { type: "next-round" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

// Fan Tan: scoop a pile of beans (beans count 60-200), remove in groups of 4.
// The remainder (1, 2, 3, or 4) is the result. (4 means 0 remainder → 4)
function generateResult(seed: number): { beanCount: number; result: FanTanBet; nextSeed: number } {
  const { rng, nextSeed } = advanceSeed(seed);
  const beanCount = 60 + Math.floor(rng() * 141); // 60-200
  const rem = beanCount % 4;
  const result = (rem === 0 ? 4 : rem) as FanTanBet;
  return { beanCount, result, nextSeed };
}

export function initialState(seed: number, settings: FanTanSettings): FanTanState {
  const { nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, roundsPlayed: 0,
    phase: "betting", bets: [], result: null, beanCount: null, lastResult: "",
  };
}

export function reducer(state: FanTanState, action: FanTanAction): FanTanState {
  const chip = parseInt(state.settings.bet, 10);
  switch (action.type) {
    case "place-bet": {
      if (state.phase !== "betting") return state;
      if (state.bets.length >= 2) return state; // max 2 bets per round
      if (state.bankroll < chip) return state;
      return {
        ...state, bankroll: state.bankroll - chip,
        bets: [...state.bets, action.on],
      };
    }
    case "remove-bet": {
      if (state.phase !== "betting") return state;
      const idx = state.bets.indexOf(action.on);
      if (idx === -1) return state;
      const newBets = [...state.bets.slice(0, idx), ...state.bets.slice(idx + 1)];
      return { ...state, bankroll: state.bankroll + chip, bets: newBets };
    }
    case "reveal": {
      if (state.phase !== "betting") return state;
      if (state.bets.length === 0) return state;
      if (state.roundsPlayed >= state.settings.roundsPerSession) return state;
      const { beanCount, result, nextSeed } = generateResult(state.rngSeed);
      // Payout: straight bet (1 number) pays 3:1. Two-number bet: 1:1 on any hit.
      let winnings = 0;
      const hitBets: FanTanBet[] = [];
      const totalBet = state.bets.length * chip;
      for (const b of state.bets) {
        if (b === result) {
          hitBets.push(b);
          if (state.bets.length === 1) winnings += chip * 3; // straight: 3:1
          else winnings += chip * 1;                          // two bets: 1:1 on hit, lose other
        }
      }
      const net = winnings - totalBet;
      const parts: string[] = [];
      if (hitBets.length > 0) parts.push(`Hit ${hitBets.join(",")}! +$${winnings}`);
      else parts.push(`Miss. Lost $${totalBet}`);
      return {
        ...state, rngSeed: nextSeed,
        bankroll: Math.max(0, state.bankroll + winnings),
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled", result, beanCount,
        lastResult: `Beans: ${beanCount} → Remainder: ${result}. ${parts.join(" ")} (net: ${net >= 0 ? "+" : ""}$${net})`,
        bets: [],
      };
    }
    case "next-round": {
      if (state.phase !== "settled") return state;
      return { ...state, phase: "betting", bets: [], result: null, beanCount: null, lastResult: "" };
    }
    default: return state;
  }
}

export function isTerminal(state: FanTanState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.roundsPlayed >= state.settings.roundsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}

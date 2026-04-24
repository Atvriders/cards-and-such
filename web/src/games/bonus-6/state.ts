import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Bonus6Settings {
  bet: "1" | "5" | "10" | "25";
  spinsPerSession: number;
}

export type Bonus6Phase = "betting" | "spinning" | "settled";

export interface Bonus6State {
  settings: Bonus6Settings;
  rngSeed: number;
  bankroll: number;
  spinsPlayed: number;
  phase: Bonus6Phase;
  spinResult: number | null; // 0-36
  betPlaced: boolean;
  lastResult: string;
  lastPayout: number;
}

export type Bonus6Action =
  | { type: "place-bet" }
  | { type: "spin" }
  | { type: "next" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

/** American roulette wheel: 0-36 (0 and 00 are mapped as 0 and 37) */
function spinWheel(rng: () => number): number {
  // European-style 0-36 for simplicity
  return Math.floor(rng() * 37);
}

/** Check if the number contains the digit 6 */
export function containsSix(n: number): boolean {
  return n.toString().includes("6");
}

export function calcBonus6Payout(result: number, bet: number): number {
  if (containsSix(result)) return bet * 6; // 6:1 net, so pay 7x and keep original?
  // Bonus 6: payout is 6:1 — you get 6x your bet plus your original back
  // But since bet is deducted upfront, winning = get bet * 7 back (net +6x)
  return 0;
}

export function initialState(seed: number, settings: Bonus6Settings): Bonus6State {
  const { nextSeed } = advanceSeed(seed);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 500,
    spinsPlayed: 0,
    phase: "betting",
    spinResult: null,
    betPlaced: false,
    lastResult: "",
    lastPayout: 0,
  };
}

export function reducer(state: Bonus6State, action: Bonus6Action): Bonus6State {
  switch (action.type) {
    case "place-bet": {
      if (state.phase !== "betting") return state;
      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;
      return { ...state, betPlaced: true, phase: "spinning" };
    }

    case "spin": {
      if (state.phase !== "spinning") return state;
      const bet = parseInt(state.settings.bet, 10);

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const result = spinWheel(rng);
      const hit = containsSix(result);
      const payout = hit ? bet * 7 : 0; // 6:1 net (return bet + 6x bet)
      const bankroll = state.bankroll - bet + payout;

      let resultMsg = `Spun: ${result}. `;
      if (hit) resultMsg += `Contains a 6! Win $${bet * 6}!`;
      else resultMsg += `No 6. Lost $${bet}.`;

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankroll),
        spinsPlayed: state.spinsPlayed + 1,
        phase: "settled",
        spinResult: result,
        lastResult: resultMsg,
        lastPayout: payout,
      };
    }

    case "next": {
      if (state.phase !== "settled") return state;
      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;
      if (state.spinsPlayed >= state.settings.spinsPerSession) return state;
      return {
        ...state,
        phase: "betting",
        spinResult: null,
        betPlaced: false,
        lastResult: "",
        lastPayout: 0,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: Bonus6State): { score: number } | null {
  const bet = parseInt(state.settings.bet, 10);
  if (state.phase === "settled" && (state.spinsPlayed >= state.settings.spinsPerSession || state.bankroll < bet)) {
    return { score: state.bankroll };
  }
  return null;
}

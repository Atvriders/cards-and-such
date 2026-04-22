import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SicBoSettings {
  startingBankroll: number;
  rollsPerSession: "10" | "25" | "50";
}

export type SicBoBetType =
  | "small"         // sum 4–10, no triple
  | "big"           // sum 11–17, no triple
  | "any-triple"    // any triple
  | { type: "specific-triple"; value: number }   // e.g. triple 4
  | { type: "specific-sum"; value: number }      // specific sum
  | { type: "specific-double"; value: number }   // pair of value (any third card)
  | { type: "specific-single"; value: number };  // 1–3 dice showing value

export type SicBoPhase = "betting" | "rolled";

export interface SicBoBet {
  betType: SicBoBetType;
  amount: number;
}

export interface SicBoState {
  settings: SicBoSettings;
  rngSeed: number;
  bankroll: number;
  rollsPlayed: number;
  phase: SicBoPhase;
  bets: SicBoBet[];
  dice: [number, number, number] | null;
  lastResult: string;
}

export type SicBoAction =
  | { type: "place-bet"; betType: SicBoBetType; amount: number }
  | { type: "clear-bets" }
  | { type: "roll" };

// Payout multipliers (not counting stake return)
export function sicBoMultiplier(betType: SicBoBetType, dice: [number, number, number]): number {
  const [d1, d2, d3] = dice;
  const sum = d1 + d2 + d3;
  const isTriple = d1 === d2 && d2 === d3;

  if (betType === "small") {
    return !isTriple && sum >= 4 && sum <= 10 ? 1 : 0;
  }
  if (betType === "big") {
    return !isTriple && sum >= 11 && sum <= 17 ? 1 : 0;
  }
  if (betType === "any-triple") {
    return isTriple ? 30 : 0;
  }

  if (typeof betType === "object") {
    switch (betType.type) {
      case "specific-triple":
        return isTriple && d1 === betType.value ? 180 : 0;

      case "specific-sum": {
        if (!isTriple || betType.value === 3 || betType.value === 18) {
          // Actually specific sums: varies
        }
        const SUM_PAYOUT: Record<number, number> = {
          4: 60, 17: 60,
          5: 30, 16: 30,
          6: 17, 15: 17,
          7: 12, 14: 12,
          8: 8, 13: 8,
          9: 6, 12: 6,
          10: 6, 11: 6,
        };
        return sum === betType.value ? (SUM_PAYOUT[betType.value] ?? 0) : 0;
      }

      case "specific-double": {
        const counts = [d1, d2, d3].filter(d => d === betType.value).length;
        return counts >= 2 ? 10 : 0;
      }

      case "specific-single": {
        const count = [d1, d2, d3].filter(d => d === betType.value).length;
        return count === 0 ? 0 : count; // 1:1, 2:1, or 3:1
      }
    }
  }

  return 0;
}

export function betLabel(betType: SicBoBetType): string {
  if (betType === "small") return "Small (4–10)";
  if (betType === "big") return "Big (11–17)";
  if (betType === "any-triple") return "Any Triple";
  if (typeof betType === "object") {
    switch (betType.type) {
      case "specific-triple": return `Triple ${betType.value}`;
      case "specific-sum": return `Sum ${betType.value}`;
      case "specific-double": return `Double ${betType.value}`;
      case "specific-single": return `Single ${betType.value}`;
    }
  }
  return "Unknown";
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function initialState(seed: number, settings: SicBoSettings): SicBoState {
  return {
    settings,
    rngSeed: seed,
    bankroll: settings.startingBankroll,
    rollsPlayed: 0,
    phase: "betting",
    bets: [],
    dice: null,
    lastResult: "",
  };
}

export function reducer(state: SicBoState, action: SicBoAction): SicBoState {
  switch (action.type) {
    case "place-bet": {
      if (state.phase !== "betting") return state;
      if (state.bankroll < action.amount) return state;
      return {
        ...state,
        bankroll: state.bankroll - action.amount,
        bets: [...state.bets, { betType: action.betType, amount: action.amount }],
      };
    }

    case "clear-bets": {
      if (state.phase !== "betting") return state;
      const refund = state.bets.reduce((sum, b) => sum + b.amount, 0);
      return { ...state, bankroll: state.bankroll + refund, bets: [] };
    }

    case "roll": {
      if (state.phase !== "betting") {
        // After seeing result, allow re-betting
        if (state.phase === "rolled") {
          const maxRolls = parseInt(state.settings.rollsPerSession, 10);
          if (state.rollsPlayed >= maxRolls || state.bankroll <= 0) return state;
          return { ...state, phase: "betting", bets: [], dice: null, lastResult: "" };
        }
        return state;
      }

      if (state.bets.length === 0) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const dice: [number, number, number] = [
        Math.floor(rng() * 6) + 1,
        Math.floor(rng() * 6) + 1,
        Math.floor(rng() * 6) + 1,
      ];

      let winnings = 0;
      const resultParts: string[] = [];

      for (const bet of state.bets) {
        const mult = sicBoMultiplier(bet.betType, dice);
        if (mult > 0) {
          const gain = bet.amount * mult;
          winnings += bet.amount + gain; // return stake + win
          resultParts.push(`${betLabel(bet.betType)}: ${mult}:1 = +$${gain}`);
        } else {
          resultParts.push(`${betLabel(bet.betType)}: lose`);
        }
      }

      const maxRolls = parseInt(state.settings.rollsPerSession, 10);
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, state.bankroll + winnings),
        rollsPlayed: state.rollsPlayed + 1,
        phase: "rolled",
        dice,
        lastResult: `[${dice.join(", ")}] Sum: ${dice[0] + dice[1] + dice[2]}. ${resultParts.join(" | ")}`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SicBoState): { score: number } | null {
  const maxRolls = parseInt(state.settings.rollsPerSession, 10);
  if (state.phase === "rolled" &&
    (state.rollsPlayed >= maxRolls || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}

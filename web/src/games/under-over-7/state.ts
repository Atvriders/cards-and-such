import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Under/Over 7: Bet on whether 2-dice sum is Under 7, Exactly 7, or Over 7.
// Under/Over pay 1:1. Exactly 7 pays 4:1.

export interface UnderOver7Settings {
  rounds: "10" | "25" | "50";
  betSize: "10" | "25" | "100";
}

export type UO7Bet = "under" | "seven" | "over";
export type UO7Phase = "betting" | "rolled" | "gameOver";

export interface UnderOver7State {
  settings: UnderOver7Settings;
  rngSeed: number;
  phase: UO7Phase;
  round: number;
  maxRounds: number;
  bankroll: number;
  betSize: number;
  currentBet: UO7Bet | null;
  lastRoll: [number, number] | null;
  lastSum: number | null;
  lastResult: "win" | "loss" | null;
  lastPayout: number;
  message: string;
  gameOver: boolean;
}

export type UnderOver7Action =
  | { type: "bet"; bet: UO7Bet }
  | { type: "next" };

export function initialState(seed: number, settings: UnderOver7Settings): UnderOver7State {
  return {
    settings,
    rngSeed: seed,
    phase: "betting",
    round: 1,
    maxRounds: parseInt(settings.rounds, 10),
    bankroll: 1000,
    betSize: parseInt(settings.betSize, 10),
    currentBet: null,
    lastRoll: null,
    lastSum: null,
    lastResult: null,
    lastPayout: 0,
    message: "Place your bet: Under 7, Exactly 7 (4:1), or Over 7.",
    gameOver: false,
  };
}

export function payoutMultiplier(bet: UO7Bet, sum: number): number {
  if (bet === "seven" && sum === 7) return 4;
  if (bet === "under" && sum < 7) return 1;
  if (bet === "over" && sum > 7) return 1;
  return -1; // lose
}

export function reducer(state: UnderOver7State, action: UnderOver7Action): UnderOver7State {
  if (state.gameOver) return state;

  switch (action.type) {
    case "bet": {
      if (state.phase !== "betting") return state;
      if (state.bankroll < state.betSize) {
        return { ...state, phase: "gameOver", gameOver: true, message: "Out of money! Game over." };
      }

      const rng = mulberry32(state.rngSeed);
      const d1 = Math.floor(rng() * 6) + 1;
      const d2 = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sum = d1 + d2;
      const mult = payoutMultiplier(action.bet, sum);
      const winnings = mult > 0 ? state.betSize * mult : 0;
      const delta = mult > 0 ? winnings : -state.betSize;
      const newBankroll = state.bankroll + delta;
      const isLastRound = state.round >= state.maxRounds;
      const newPhase: UO7Phase = isLastRound ? "gameOver" : "rolled";

      const betLabel = action.bet === "under" ? "Under 7" : action.bet === "seven" ? "Exactly 7" : "Over 7";
      const won = mult > 0;
      const resultMsg = won ? `You win ${winnings}! (${mult}:1)` : `You lose ${state.betSize}.`;

      return {
        ...state,
        rngSeed: nextSeed,
        phase: newPhase,
        round: isLastRound ? state.round : state.round,
        currentBet: action.bet,
        lastRoll: [d1, d2],
        lastSum: sum,
        lastResult: won ? "win" : "loss",
        lastPayout: won ? winnings : 0,
        bankroll: newBankroll,
        message: `Bet: ${betLabel}. Dice: ${d1}+${d2}=${sum}. ${resultMsg} Bankroll: ${newBankroll}.`,
        gameOver: isLastRound,
      };
    }

    case "next": {
      if (state.phase !== "rolled") return state;
      return {
        ...state,
        phase: "betting",
        round: state.round + 1,
        currentBet: null,
        lastRoll: null,
        lastSum: null,
        lastResult: null,
        lastPayout: 0,
        message: "Place your bet: Under 7, Exactly 7 (4:1), or Over 7.",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: UnderOver7State): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.bankroll };
}

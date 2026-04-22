import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Chō-han: Japanese 2-dice gambling game.
// Bet Chō (even) or Han (odd) on the sum. 1:1 payout.

export interface ChoHanSettings {
  rounds: "10" | "25" | "50";
  betSize: "10" | "25" | "100";
}

export type ChoHanBet = "cho" | "han";
export type Phase = "betting" | "rolled" | "gameOver";

export interface ChoHanState {
  settings: ChoHanSettings;
  rngSeed: number;
  phase: Phase;
  round: number;
  maxRounds: number;
  bankroll: number;
  betSize: number;
  currentBet: ChoHanBet | null;
  lastRoll: [number, number] | null;
  lastSum: number | null;
  lastResult: "win" | "loss" | null;
  message: string;
  gameOver: boolean;
}

export type ChoHanAction =
  | { type: "bet"; bet: ChoHanBet }
  | { type: "next" };

export function initialState(seed: number, settings: ChoHanSettings): ChoHanState {
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
    message: "Place your bet — Chō (even) or Han (odd).",
    gameOver: false,
  };
}

export function reducer(state: ChoHanState, action: ChoHanAction): ChoHanState {
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
      const isEven = sum % 2 === 0;
      const betWins = (action.bet === "cho" && isEven) || (action.bet === "han" && !isEven);
      const delta = betWins ? state.betSize : -state.betSize;
      const newBankroll = state.bankroll + delta;
      const isLastRound = state.round >= state.maxRounds;
      const newPhase: Phase = isLastRound ? "gameOver" : "rolled";

      const betLabel = action.bet === "cho" ? "Chō (even)" : "Han (odd)";
      const sumType = isEven ? "even" : "odd";
      const resultMsg = betWins ? `You win ${state.betSize}!` : `You lose ${state.betSize}.`;

      return {
        ...state,
        rngSeed: nextSeed,
        phase: newPhase,
        currentBet: action.bet,
        lastRoll: [d1, d2],
        lastSum: sum,
        lastResult: betWins ? "win" : "loss",
        bankroll: newBankroll,
        message: `You bet ${betLabel}. Dice: ${d1}+${d2}=${sum} (${sumType}). ${resultMsg}`,
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
        message: "Place your bet — Chō (even) or Han (odd).",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ChoHanState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.bankroll };
}

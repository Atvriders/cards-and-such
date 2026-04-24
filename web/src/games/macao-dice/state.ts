import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Macao (Macau) — a dice-betting game.
 * Roll one die. Dealer also rolls one die.
 * Both reveal simultaneously.
 * If your die > dealer's: win your bet.
 * If your die < dealer's: lose your bet.
 * Tie: both roll again (best of ties wins based on total).
 * Special: rolling a 6 before dealer is "Macao" — wins 3x bet.
 * Player has chips; play 10 rounds. Score = final chips.
 */

export interface MacaoDiceSettings {
  startChips: "10" | "20" | "50";
}

export type Phase = "betting" | "rolled" | "tieBreak" | "roundOver" | "done";

export interface MacaoDiceState {
  settings: MacaoDiceSettings;
  rngSeed: number;
  chips: number;
  bet: number;
  round: number;
  totalRounds: number;
  playerDie: number;
  dealerDie: number;
  tieTotals: [number, number];
  phase: Phase;
  lastResult: string;
}

export type MacaoDiceAction =
  | { type: "setBet"; amount: number }
  | { type: "roll" }
  | { type: "nextRound" };

function rollOne(seed: number): { value: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v1 = rng();
  const ns = (Math.floor(v1 * 2 ** 31)) >>> 0;
  const rng2 = mulberry32(seed);
  return { value: Math.floor(rng2() * 6) + 1, nextSeed: ns };
}

function rollTwo(seed: number): { p: number; d: number; nextSeed: number } {
  const { value: p, nextSeed: s1 } = rollOne(seed);
  const { value: d, nextSeed: s2 } = rollOne(s1);
  return { p, d, nextSeed: s2 };
}

export function initialState(seed: number, settings: MacaoDiceSettings): MacaoDiceState {
  return {
    settings,
    rngSeed: seed >>> 0,
    chips: Number(settings.startChips),
    bet: 1,
    round: 1,
    totalRounds: 10,
    playerDie: 0,
    dealerDie: 0,
    tieTotals: [0, 0],
    phase: "betting",
    lastResult: "",
  };
}

export function reducer(state: MacaoDiceState, action: MacaoDiceAction): MacaoDiceState {
  switch (action.type) {
    case "setBet": {
      if (state.phase !== "betting") return state;
      const bet = Math.max(1, Math.min(action.amount, state.chips));
      return { ...state, bet };
    }

    case "roll": {
      if (state.phase === "betting") {
        if (state.bet <= 0 || state.bet > state.chips) return state;
        const { p, d, nextSeed } = rollTwo(state.rngSeed);
        if (p === d) {
          return {
            ...state,
            rngSeed: nextSeed,
            playerDie: p,
            dealerDie: d,
            tieTotals: [p, d],
            phase: "tieBreak",
            lastResult: `Tie! Both rolled ${p}. Roll again to break the tie.`,
          };
        }
        const macao = p === 6 && d !== 6;
        const win = p > d || macao;
        const payout = macao ? state.bet * 3 : state.bet;
        const chips = win ? state.chips + payout : state.chips - state.bet;
        const result = win
          ? `You rolled ${p}, dealer rolled ${d}. ${macao ? "MACAO! You win 3× your bet!" : "You win!"} +${payout} chips.`
          : `You rolled ${p}, dealer rolled ${d}. Dealer wins. −${state.bet} chips.`;
        return {
          ...state,
          rngSeed: nextSeed,
          chips,
          playerDie: p,
          dealerDie: d,
          phase: "roundOver",
          lastResult: result,
        };
      }

      if (state.phase === "tieBreak") {
        const { p, d, nextSeed } = rollTwo(state.rngSeed);
        const newPTot = state.tieTotals[0] + p;
        const newDTot = state.tieTotals[1] + d;
        if (p === d) {
          return {
            ...state,
            rngSeed: nextSeed,
            playerDie: p,
            dealerDie: d,
            tieTotals: [newPTot, newDTot],
            lastResult: `Tie again! Both rolled ${p}. Roll again.`,
          };
        }
        const win = newPTot > newDTot;
        const payout = state.bet;
        const chips = win ? state.chips + payout : state.chips - payout;
        const result = win
          ? `Tie-break: you rolled ${p} (total ${newPTot}) vs dealer ${d} (total ${newDTot}). You win! +${payout} chips.`
          : `Tie-break: you rolled ${p} (total ${newPTot}) vs dealer ${d} (total ${newDTot}). Dealer wins. −${payout} chips.`;
        return {
          ...state,
          rngSeed: nextSeed,
          chips,
          playerDie: p,
          dealerDie: d,
          tieTotals: [newPTot, newDTot],
          phase: "roundOver",
          lastResult: result,
        };
      }

      return state;
    }

    case "nextRound": {
      if (state.phase !== "roundOver") return state;
      const newRound = state.round + 1;
      const done = newRound > state.totalRounds || state.chips <= 0;
      return {
        ...state,
        round: newRound,
        bet: Math.min(state.bet, state.chips),
        playerDie: 0,
        dealerDie: 0,
        tieTotals: [0, 0],
        phase: done ? "done" : "betting",
        lastResult: done ? state.lastResult : "",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MacaoDiceState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.chips };
}

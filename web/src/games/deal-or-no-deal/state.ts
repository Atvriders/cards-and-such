import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DealOrNoDealSettings {
  cases: "26" | "16";
}

const AMOUNTS_26 = [
  0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750,
  1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000,
  300000, 400000, 500000, 750000, 1000000,
];

const AMOUNTS_16 = [
  1, 5, 10, 25, 50, 100, 200, 500, 1000, 5000, 10000, 25000,
  50000, 100000, 500000, 1000000,
];

// Cases to open per round (26-case version)
const ROUND_SIZES_26 = [6, 5, 4, 3, 2, 1, 1, 1, 1];
const ROUND_SIZES_16 = [4, 3, 2, 2, 1, 1, 1, 1];

export interface DealCase {
  id: number;
  amount: number;
  eliminated: boolean;
}

export type DondPhase = "pick_own" | "eliminating" | "bank_offer" | "deal" | "no_deal_end" | "done";

export interface DealOrNoDealState {
  settings: DealOrNoDealSettings;
  cases: DealCase[];
  playerCaseId: number | null;
  round: number;
  casesThisRound: number; // how many left to open this round
  bankOffer: number;
  accepted: boolean | null;
  finalReveal: boolean;
  phase: DondPhase;
  seed: number;
}

export type DondAction =
  | { type: "pick_case"; caseId: number }
  | { type: "eliminate"; caseId: number }
  | { type: "accept_deal" }
  | { type: "reject_deal" }
  | { type: "reveal_own" };

export function initialState(seed: number, settings: DealOrNoDealSettings): DealOrNoDealState {
  const rng = mulberry32(seed);
  const amounts = settings.cases === "26" ? [...AMOUNTS_26] : [...AMOUNTS_16];
  // shuffle
  for (let i = amounts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [amounts[i], amounts[j]] = [amounts[j]!, amounts[i]!];
  }
  const cases: DealCase[] = amounts.map((amount, i) => ({ id: i + 1, amount, eliminated: false }));
  const roundSizes = settings.cases === "26" ? ROUND_SIZES_26 : ROUND_SIZES_16;
  return {
    settings,
    cases,
    playerCaseId: null,
    round: 1,
    casesThisRound: roundSizes[0]!,
    bankOffer: 0,
    accepted: null,
    finalReveal: false,
    phase: "pick_own",
    seed,
  };
}

function computeBankOffer(cases: DealCase[], playerCaseId: number, round: number, totalRounds: number): number {
  const remaining = cases.filter(c => !c.eliminated && c.id !== playerCaseId);
  if (remaining.length === 0) return 0;
  const avg = remaining.reduce((s, c) => s + c.amount, 0) / remaining.length;
  // bank offers a fraction that increases over rounds
  const fraction = 0.1 + (round / totalRounds) * 0.8;
  return Math.round(avg * fraction);
}

export function reducer(state: DealOrNoDealState, action: DondAction): DealOrNoDealState {
  const roundSizes = state.settings.cases === "26" ? ROUND_SIZES_26 : ROUND_SIZES_16;
  const totalRounds = roundSizes.length;

  switch (action.type) {
    case "pick_case": {
      if (state.phase !== "pick_own") return state;
      return {
        ...state,
        playerCaseId: action.caseId,
        phase: "eliminating",
      };
    }

    case "eliminate": {
      if (state.phase !== "eliminating") return state;
      if (action.caseId === state.playerCaseId) return state;
      const c = state.cases.find(x => x.id === action.caseId);
      if (!c || c.eliminated) return state;

      const newCases = state.cases.map(x => x.id === action.caseId ? { ...x, eliminated: true } : x);
      const newCasesThisRound = state.casesThisRound - 1;

      if (newCasesThisRound > 0) {
        return { ...state, cases: newCases, casesThisRound: newCasesThisRound };
      }

      // Round complete — compute bank offer
      const offer = computeBankOffer(newCases, state.playerCaseId!, state.round, totalRounds);

      // Check if only 1 non-player case remains
      const remaining = newCases.filter(x => !x.eliminated && x.id !== state.playerCaseId);
      if (remaining.length === 0) {
        return { ...state, cases: newCases, casesThisRound: 0, bankOffer: offer, phase: "bank_offer" };
      }

      return {
        ...state,
        cases: newCases,
        casesThisRound: 0,
        bankOffer: offer,
        phase: "bank_offer",
      };
    }

    case "accept_deal": {
      if (state.phase !== "bank_offer") return state;
      return { ...state, accepted: true, phase: "deal" };
    }

    case "reject_deal": {
      if (state.phase !== "bank_offer") return state;
      const nextRound = state.round + 1;
      const remaining = state.cases.filter(x => !x.eliminated && x.id !== state.playerCaseId);
      if (remaining.length <= 1) {
        return { ...state, accepted: false, phase: "no_deal_end" };
      }
      const nextCases = nextRound <= totalRounds ? roundSizes[nextRound - 1]! : 1;
      return {
        ...state,
        round: nextRound,
        casesThisRound: nextCases,
        accepted: false,
        bankOffer: 0,
        phase: "eliminating",
      };
    }

    case "reveal_own": {
      return { ...state, finalReveal: true, phase: "done" };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DealOrNoDealState): { score: number } | null {
  if (state.phase === "deal") {
    return { score: state.bankOffer };
  }
  if (state.phase === "done") {
    const ownCase = state.cases.find(c => c.id === state.playerCaseId);
    return { score: Math.round(ownCase ? ownCase.amount : 0) };
  }
  if (state.phase === "no_deal_end") {
    // swap for last remaining
    const remaining = state.cases.filter(c => !c.eliminated && c.id !== state.playerCaseId);
    const won = remaining.length === 1 ? remaining[0]! : state.cases.find(c => c.id === state.playerCaseId)!;
    return { score: Math.round(won.amount) };
  }
  return null;
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Shared card-drafting engine.
 *
 * Each round the player is offered N cards from a deck. Player picks one,
 * CPU picks the highest-rank remaining. Both build tableaux. Score = sum of
 * card ranks + suit-set bonuses + rank-pair bonuses, plus a +25 win bonus.
 */

export interface DraftCard {
  id: number;
  rank: number;   // 1-9 (or 1-N), the numeric value
  suit: number;   // 0..NUM_SUITS-1, category index
  label?: string; // optional override label
}

export interface DraftConfig {
  rounds: number;
  offerSize: number;
  numSuits: number;
  rankMin: number;
  rankMax: number;
  /** Suit set bonus thresholds: e.g. [{count:3, pts:10},{count:5, pts:25}] */
  suitBonus: { count: number; pts: number }[];
  /** Rank-pair bonus: e.g. [{count:2, pts:5},{count:3, pts:10}] */
  rankBonus: { count: number; pts: number }[];
  /** Optional bonus for playing all rounds (completion bonus) */
  completionBonus?: number;
  /** Optional: bonus added to score if you win vs CPU (default 25) */
  winBonus?: number;
}

export const DEFAULT_DRAFT_CONFIG: DraftConfig = {
  rounds: 8,
  offerSize: 3,
  numSuits: 4,
  rankMin: 1,
  rankMax: 9,
  suitBonus: [{ count: 3, pts: 10 }, { count: 5, pts: 15 }],
  rankBonus: [{ count: 2, pts: 5 }, { count: 3, pts: 10 }],
  winBonus: 25,
};

export interface DraftState {
  rngSeed: number;
  round: number;
  totalRounds: number;
  offer: DraftCard[];
  myTableau: DraftCard[];
  cpuTableau: DraftCard[];
  myScore: number;
  cpuScore: number;
  lastEvent: string | null;
  phase: "drafting" | "round-done" | "done";
  config: DraftConfig;
}

export type DraftAction = { type: "pick"; idx: number } | { type: "next" };

export function dealOffer(rng: () => number, cfg: DraftConfig): DraftCard[] {
  const out: DraftCard[] = [];
  for (let i = 0; i < cfg.offerSize; i++) {
    out.push({
      id: Math.floor(rng() * 1e9),
      rank: cfg.rankMin + Math.floor(rng() * (cfg.rankMax - cfg.rankMin + 1)),
      suit: Math.floor(rng() * cfg.numSuits),
    });
  }
  return out;
}

export function tableauScore(t: DraftCard[], cfg: DraftConfig): number {
  const suitCounts: Record<number, number> = {};
  const rankCounts: Record<number, number> = {};
  let sum = 0;
  for (const c of t) {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    sum += c.rank;
  }
  let bonus = 0;
  for (const k of Object.keys(suitCounts)) {
    const n = suitCounts[parseInt(k)] || 0;
    for (const b of cfg.suitBonus) if (n >= b.count) bonus += b.pts;
  }
  for (const k of Object.keys(rankCounts)) {
    const n = rankCounts[parseInt(k)] || 0;
    for (const b of cfg.rankBonus) if (n >= b.count) bonus += b.pts;
  }
  return sum + bonus;
}

export function initialDraftState(seed: number, cfg: DraftConfig = DEFAULT_DRAFT_CONFIG): DraftState {
  const rng = mulberry32(seed);
  const offer = dealOffer(rng, cfg);
  const next = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: next,
    round: 1,
    totalRounds: cfg.rounds,
    offer,
    myTableau: [],
    cpuTableau: [],
    myScore: 0,
    cpuScore: 0,
    lastEvent: null,
    phase: "drafting",
    config: cfg,
  };
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  if (state.phase === "done") return state;
  if (action.type === "pick" && state.phase === "drafting") {
    if (action.idx < 0 || action.idx >= state.offer.length) return state;
    const myCard = state.offer[action.idx];
    if (!myCard) return state;
    const rest = state.offer.filter((_, i) => i !== action.idx);
    let cpuIdx = 0;
    for (let i = 1; i < rest.length; i++) if ((rest[i]?.rank || 0) > (rest[cpuIdx]?.rank || 0)) cpuIdx = i;
    const cpuCard = rest[cpuIdx];
    if (!cpuCard) return state;
    const myT = [...state.myTableau, myCard];
    const cpuT = [...state.cpuTableau, cpuCard];
    const myS = tableauScore(myT, state.config);
    const cpuS = tableauScore(cpuT, state.config);
    const evt = "You took rank " + myCard.rank + " (suit " + myCard.suit + ") | CPU took rank " + cpuCard.rank;
    const isLast = state.round >= state.totalRounds;
    return {
      ...state,
      myTableau: myT,
      cpuTableau: cpuT,
      myScore: myS,
      cpuScore: cpuS,
      lastEvent: evt,
      phase: isLast ? "done" : "round-done",
    };
  }
  if (action.type === "next" && state.phase === "round-done") {
    const rng = mulberry32(state.rngSeed);
    const offer = dealOffer(rng, state.config);
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, offer, lastEvent: null, phase: "drafting" };
  }
  return state;
}

export function draftFinalScore(s: DraftState): number {
  const winBonus = s.config.winBonus ?? 25;
  const margin = s.myScore - s.cpuScore;
  const completionBonus = s.config.completionBonus ?? 0;
  return Math.max(0, s.myScore + (margin > 0 ? winBonus : 0) + (s.phase === "done" ? completionBonus : 0));
}

export function draftIsTerminal(s: DraftState): { score: number } | null {
  return s.phase === "done" ? { score: draftFinalScore(s) } : null;
}

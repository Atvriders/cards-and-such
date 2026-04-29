import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DraftCard { id: number; rank: number; suit: number; }
export interface SevenWondersBabelSettings { dummy: boolean; }
export interface SevenWondersBabelState {
  rngSeed: number;
  round: number;
  offer: DraftCard[];
  myTableau: DraftCard[];
  cpuTableau: DraftCard[];
  myScore: number;
  cpuScore: number;
  lastEvent: string | null;
  phase: "drafting" | "round-done" | "done";
}
export type SevenWondersBabelAction = { type: "pick"; idx: number } | { type: "next" };

export function suitName(s: number): string { return ["Sun", "Moon", "Star", "Leaf"][s] || "?"; }
export function rankName(r: number): string { return String(r); }

function dealOffer(rng: () => number): DraftCard[] {
  const out: DraftCard[] = [];
  for (let i = 0; i < 3; i++) {
    out.push({ id: Math.floor(rng() * 1e9), rank: 1 + Math.floor(rng() * 9), suit: Math.floor(rng() * 4) });
  }
  return out;
}

function tableauScore(t: DraftCard[]): number {
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
    if (n >= 3) bonus += 10;
    if (n >= 5) bonus += 15;
  }
  for (const k of Object.keys(rankCounts)) {
    const n = rankCounts[parseInt(k)] || 0;
    if (n >= 2) bonus += 5;
    if (n >= 3) bonus += 10;
  }
  return sum + bonus;
}

export function initialState(seed: number, _s: SevenWondersBabelSettings): SevenWondersBabelState {
  const rng = mulberry32(seed);
  const offer = dealOffer(rng);
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, offer, myTableau: [], cpuTableau: [], myScore: 0, cpuScore: 0, lastEvent: null, phase: "drafting" };
}

export function reducer(state: SevenWondersBabelState, action: SevenWondersBabelAction): SevenWondersBabelState {
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
    const myS = tableauScore(myT);
    const cpuS = tableauScore(cpuT);
    const evt = "You took " + rankName(myCard.rank) + " of " + suitName(myCard.suit) + " | CPU took " + rankName(cpuCard.rank) + " of " + suitName(cpuCard.suit);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, myTableau: myT, cpuTableau: cpuT, myScore: myS, cpuScore: cpuS, lastEvent: evt, phase: isLast ? "done" : "round-done" };
  }
  if (action.type === "next" && state.phase === "round-done") {
    const rng = mulberry32(state.rngSeed);
    const offer = dealOffer(rng);
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, offer, lastEvent: null, phase: "drafting" };
  }
  return state;
}

export function score(s: SevenWondersBabelState): number {
  const margin = s.myScore - s.cpuScore;
  return Math.max(0, s.myScore + (margin > 0 ? 25 : 0));
}
export function isTerminal(s: SevenWondersBabelState): { score: number } | null { return s.phase === "done" ? { score: score(s) } : null; }

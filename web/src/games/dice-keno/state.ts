import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Keno: 8 rounds. Player picks 5 numbers from 1..6 (with possible repeats actually — let's say multiset of size 5).
// Then 5 dice are rolled. Score = number of matches (multiset intersection size) * 6, plus +20 if all 5 match.
// Simplification: player picks a count of each face 1..6 totalling 5.

export const TOTAL_ROUNDS = 8;
export const PICK_COUNT = 5;

export interface DiceKenoSettings { dummy: boolean; }

export interface DiceKenoState {
  rngSeed: number;
  round: number;
  picks: number[]; // length 6: count chosen for each face 1..6 (sum should be PICK_COUNT)
  picksTotal: number;
  rolls: [number, number, number, number, number] | null;
  matches: number;
  score: number;
  phase: "picking" | "result" | "done";
  lastPts: number;
  jackpot: boolean;
}

export type DiceKenoAction = { type: "pick"; face: number } | { type: "unpick"; face: number } | { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKenoSettings): DiceKenoState {
  return { rngSeed: seed, round: 1, picks: [0,0,0,0,0,0], picksTotal: 0, rolls: null, matches: 0, score: 0, phase: "picking", lastPts: 0, jackpot: false };
}

function multisetIntersection(picks: number[], rolls: number[]): number {
  const rollCounts = [0,0,0,0,0,0];
  for (const r of rolls) rollCounts[r-1]!++;
  let n = 0;
  for (let i = 0; i < 6; i++) n += Math.min(picks[i]!, rollCounts[i]!);
  return n;
}

export function reducer(state: DiceKenoState, action: DiceKenoAction): DiceKenoState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    if (state.picksTotal >= PICK_COUNT) return state;
    const picks = [...state.picks];
    picks[action.face-1] = (picks[action.face-1] || 0) + 1;
    return { ...state, picks, picksTotal: state.picksTotal + 1 };
  }
  if (action.type === "unpick") {
    if (state.phase !== "picking") return state;
    if ((state.picks[action.face-1] || 0) <= 0) return state;
    const picks = [...state.picks];
    picks[action.face-1] = (picks[action.face-1] || 0) - 1;
    return { ...state, picks, picksTotal: state.picksTotal - 1 };
  }
  if (action.type === "roll") {
    if (state.phase !== "picking" || state.picksTotal !== PICK_COUNT) return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: [number, number, number, number, number] = [
      1 + Math.floor(rng() * 6),
      1 + Math.floor(rng() * 6),
      1 + Math.floor(rng() * 6),
      1 + Math.floor(rng() * 6),
      1 + Math.floor(rng() * 6),
    ];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const matches = multisetIntersection(state.picks, rolls);
    const jackpot = matches === PICK_COUNT;
    let pts = matches * 6;
    if (jackpot) pts += 20;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, matches, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts, jackpot };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, picks: [0,0,0,0,0,0], picksTotal: 0, rolls: null, matches: 0, phase: "picking", lastPts: 0, jackpot: false };
  }
  return state;
}

export function isTerminal(state: DiceKenoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

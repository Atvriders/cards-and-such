import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ISLANDS = 16;
export const HOPS = 12;

export interface DiceIslandHopSettings { dummy: boolean; }

export interface DiceIslandHopState {
  rngSeed: number;
  pos: number;
  hops: number;
  rolls: [number, number] | null;
  bonus: Record<number, number>;
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
}

export type DiceIslandHopAction = { type: "hop" } | { type: "next" };

const LADDERS: Record<number, number> = { 3: 7, 8: 12, 11: 14 };
const SNAKES: Record<number, number> = { 9: 4, 13: 6 };

export function initialState(seed: number, _settings: DiceIslandHopSettings): DiceIslandHopState {
  return { rngSeed: seed, pos: 0, hops: HOPS, rolls: null, bonus: {}, score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceIslandHopState, action: DiceIslandHopAction): DiceIslandHopState {
  if (state.phase === "done") return state;
  if (action.type === "hop" && state.phase === "roll" && state.hops > 0) {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let move = r1 + r2;
    let pos = state.pos + move;
    let log = `Hop +${move} to island ${Math.min(pos, ISLANDS)}.`;
    if (pos > ISLANDS) { pos = ISLANDS - (pos - ISLANDS); log += ` Bounced back.`; }
    if (pos < 0) pos = 0;
    if (LADDERS[pos]) {
      log += ` Bridge → ${LADDERS[pos]}!`;
      pos = LADDERS[pos]!;
    } else if (SNAKES[pos]) {
      log += ` Riptide → ${SNAKES[pos]}.`;
      pos = SNAKES[pos]!;
    }
    let score = state.score + 4 + (r1 === r2 ? 6 : 0);
    if (r1 === r2) log += ` Doubles +6.`;
    let phase: DiceIslandHopState["phase"] = "result";
    if (pos >= ISLANDS) {
      score += 50 + state.hops * 4;
      phase = "done";
      log += ` Reached the final island!`;
    } else if (state.hops - 1 <= 0) {
      phase = "done";
      log += ` Out of hops at island ${pos}.`;
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], pos, hops: state.hops - 1, score, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "roll", rolls: null, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceIslandHopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

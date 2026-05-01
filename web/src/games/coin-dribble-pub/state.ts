import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 40;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface CoinDribblePubSettings { dummy: boolean; }

export interface CoinDribblePubState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myScore: number;
  cpuScore: number;
}

export type CoinDribblePubAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: CoinDribblePubSettings): CoinDribblePubState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myScore: 0,
    cpuScore: 0,
  };
}

export function reducer(state: CoinDribblePubState, action: CoinDribblePubAction): CoinDribblePubState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<CoinDribblePubState> = {};
    const me = Math.abs(dice[0]! + dice[1]! - 7);
    const cpu = Math.abs(dice[2]! + (dice[3] || 3) - 7);
    let mePts = me <= 1 ? 5 : me <= 2 ? 3 : me <= 3 ? 1 : 0;
    let cpuPts = cpu <= 1 ? 5 : cpu <= 2 ? 3 : cpu <= 3 ? 1 : 0;
    extra.myScore = state.myScore + mePts;
    extra.cpuScore = state.cpuScore + cpuPts;
    pts = mePts;
    logEntry = `R${state.round}: you +${mePts}, CPU +${cpuPts}`;

    const earlyWin = ((extra.myScore !== undefined && extra.myScore >= 50) || (extra.cpuScore !== undefined && extra.cpuScore >= 50));
    const isLast = state.round >= TOTAL_ROUNDS || earlyWin;
    return {
      ...state, ...extra, rngSeed: nextSeed, dice,
      score: state.score + pts, lastPts: pts,
      history: [...state.history, pts],
      log: [...state.log, logEntry].slice(-12),
      phase: isLast ? "done" : "rolled",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: CoinDribblePubState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}

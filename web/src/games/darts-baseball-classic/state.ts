import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 9;
export const DICE_COUNT = 3;
export const DICE_SIDES = 6;

export interface DartsBaseballClassicSettings { dummy: boolean; }

export interface DartsBaseballClassicState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  runs: number;
  cpu: number;
  outs: number;
}

export type DartsBaseballClassicAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DartsBaseballClassicSettings): DartsBaseballClassicState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    runs: 0,
    cpu: 0,
    outs: 0,
  };
}

export function reducer(state: DartsBaseballClassicState, action: DartsBaseballClassicAction): DartsBaseballClassicState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DartsBaseballClassicState> = {};
    const me = dice[0]! + dice[1]!;
    const cpu = dice[2]!;
    let runs = 0;
    if (me >= 11) runs = 4;
    else if (me >= 9) runs = 2;
    else if (me >= 7) runs = 1;
    extra.runs = state.runs + runs;
    extra.cpu = state.cpu + (cpu >= 5 ? 2 : cpu >= 3 ? 1 : 0);
    pts = runs * 5 - (cpu >= 5 ? 4 : cpu >= 3 ? 2 : 0);
    logEntry = `Inn ${state.round}: HOME +${runs}, AWAY +${cpu >= 5 ? 2 : cpu >= 3 ? 1 : 0}`;

    const earlyWin = (false);
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

export function isTerminal(state: DartsBaseballClassicState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}

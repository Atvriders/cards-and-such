import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 80;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceThunderPitSettings { dummy: boolean; }

export interface DiceThunderPitState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  lastPts: number;
  score: number;
  history: number[];
  log: string[];
  phase: "rolling" | "rolled" | "done";
  myPos: number;
  cpuPos: [number, number, number];
}

export type DiceThunderPitAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceThunderPitSettings): DiceThunderPitState {
  return {
    rngSeed: seed,
    round: 1,
    dice: null,
    lastPts: 0,
    score: 0,
    history: [],
    log: [],
    phase: "rolling",
    myPos: 0,
    cpuPos: [0, 0, 0],
  };
}

export function reducer(state: DiceThunderPitState, action: DiceThunderPitAction): DiceThunderPitState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceThunderPitState> = {};
    const me = Math.max(1, dice[0]! - 1 + dice[1]!);
    const newMy = Math.min(18, state.myPos + me);
    extra.myPos = newMy;
    const newCpu: [number, number, number] = [
      Math.min(18, state.cpuPos[0] + Math.max(1, (dice[2] || 3))),
      Math.min(18, state.cpuPos[1] + Math.max(1, (dice[3] || 3))),
      Math.min(18, state.cpuPos[2] + Math.max(1, dice[0]! - 1)),
    ];
    extra.cpuPos = newCpu;
    pts = me * 2;
    if (newMy >= 18) {
      pts += 100;
      logEntry = `LAP ${state.round}: FINISH! +100 bonus`;
    } else if (newCpu.some(p => p >= 18)) {
      pts -= 30;
      logEntry = `LAP ${state.round}: CPU finished first`;
    } else {
      logEntry = `LAP ${state.round}: moved ${me} (pos ${newMy}/18)`;
    }

    const earlyWin = ((extra.myPos !== undefined && extra.myPos >= 18) || (extra.cpuPos !== undefined && extra.cpuPos.some(p => p >= 18)));
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

export function isTerminal(state: DiceThunderPitState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}

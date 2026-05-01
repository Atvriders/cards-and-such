import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 80;
export const DICE_COUNT = 4;
export const DICE_SIDES = 6;

export interface DiceFormulaDeSettings { dummy: boolean; }

export interface DiceFormulaDeState {
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

export type DiceFormulaDeAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceFormulaDeSettings): DiceFormulaDeState {
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

export function reducer(state: DiceFormulaDeState, action: DiceFormulaDeAction): DiceFormulaDeState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) dice.push(1 + Math.floor(rng() * DICE_SIDES));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    let logEntry = "";
    let extra: Partial<DiceFormulaDeState> = {};
    const me = Math.max(1, dice[0]! - 1 + dice[1]!);
    const newMy = Math.min(24, state.myPos + me);
    extra.myPos = newMy;
    const newCpu: [number, number, number] = [
      Math.min(24, state.cpuPos[0] + Math.max(1, (dice[2] || 3))),
      Math.min(24, state.cpuPos[1] + Math.max(1, (dice[3] || 3))),
      Math.min(24, state.cpuPos[2] + Math.max(1, dice[0]! - 1)),
    ];
    extra.cpuPos = newCpu;
    pts = me * 2;
    if (newMy >= 24) {
      pts += 100;
      logEntry = `LAP ${state.round}: FINISH! +100 bonus`;
    } else if (newCpu.some(p => p >= 24)) {
      pts -= 30;
      logEntry = `LAP ${state.round}: CPU finished first`;
    } else {
      logEntry = `LAP ${state.round}: moved ${me} (pos ${newMy}/24)`;
    }

    const earlyWin = ((extra.myPos !== undefined && extra.myPos >= 24) || (extra.cpuPos !== undefined && extra.cpuPos.some(p => p >= 24)));
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

export function isTerminal(state: DiceFormulaDeState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}

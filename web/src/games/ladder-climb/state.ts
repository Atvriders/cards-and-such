import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ladder Climb: Climb rungs by clicking at the right timing. Each rung has a moving "grip window". Miss = fall back.

export interface LadderClimbSettings { rungs: "5" | "10"; }

export interface LadderClimbState {
  rung: number;
  maxRungs: number;
  gripPos: number;       // 0-100 position of grip marker
  gripDir: 1 | -1;
  gripSpeed: number;
  score: number;
  phase: "climbing" | "result" | "gameover";
  lastSuccess: boolean | null;
  rngSeed: number;
}

export type LadderClimbAction = { type: "grab" } | { type: "tick" } | { type: "next" };

export function initialState(seed: number, settings: LadderClimbSettings): LadderClimbState {
  const rng = mulberry32(seed);
  const speed = 3 + Math.floor(rng() * 5);
  return { rung: 1, maxRungs: parseInt(settings.rungs, 10), gripPos: 10, gripDir: 1, gripSpeed: speed, score: 0, phase: "climbing", lastSuccess: null, rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: LadderClimbState, action: LadderClimbAction): LadderClimbState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "climbing") return state;
    let pos = state.gripPos + state.gripDir * state.gripSpeed;
    let dir = state.gripDir;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    return { ...state, gripPos: pos, gripDir: dir };
  }
  if (action.type === "grab") {
    if (state.phase !== "climbing") return state;
    const success = state.gripPos >= 40 && state.gripPos <= 60;
    const pts = success ? 20 * state.rung : 0;
    const newRung = success ? state.rung + 1 : Math.max(1, state.rung - 1);
    const phase = newRung > state.maxRungs ? "gameover" : "result";
    return { ...state, rung: newRung, score: state.score + pts, lastSuccess: success, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const speed = 3 + Math.floor(rng() * 6);
    return { ...state, gripPos: 10, gripDir: 1, gripSpeed: speed, phase: "climbing", lastSuccess: null, rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: LadderClimbState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}

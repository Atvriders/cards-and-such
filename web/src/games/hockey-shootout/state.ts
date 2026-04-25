import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HockeyShootoutSettings {
  shots: "5" | "10";
}

export interface ShootoutAttempt {
  aim: number;     // 0..1 horizontal
  height: number;  // 0..1 vertical
  fakeDir: number; // 0..1 (deke direction)
  goalieReact: number;
  scored: boolean;
}

export interface HockeyShootoutState {
  settings: HockeyShootoutSettings;
  rngSeed: number;
  totalShots: number;
  shotIndex: number;
  attempts: ShootoutAttempt[];
  aim: number;
  height: number;
  fakeDir: number;
  goalieReact: number;
  phase: "aim" | "result" | "done";
  lastResult: string;
  goals: number;
}

export type HockeyShootoutAction =
  | { type: "set-aim"; value: number }
  | { type: "set-height"; value: number }
  | { type: "set-fake"; value: number }
  | { type: "shoot" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function shootoutResult(aim: number, height: number, fakeDir: number, goalieReact: number, seed: number): boolean {
  const rng = mulberry32(seed);
  // Goalie is fooled if fake goes away from aim
  const fakeEffect = Math.abs(fakeDir - aim) > 0.35 ? 0.4 : 0;
  const goaliePos = goalieReact + fakeEffect * (aim > 0.5 ? 0.15 : -0.15);
  const dist = Math.abs(aim - Math.max(0.15, Math.min(0.85, goaliePos)));
  const saveRadius = 0.18 + rng() * 0.06;
  if (dist < saveRadius && height < 0.75) return false;
  // Post/crossbar check (extremes)
  if (aim < 0.05 || aim > 0.95) return rng() < 0.35;
  if (height > 0.92) return rng() < 0.4;
  return true;
}

export function initialState(seed: number, settings: HockeyShootoutSettings): HockeyShootoutState {
  const rng = mulberry32(seed);
  const goalieReact = rng() * 0.4 + 0.3;
  return {
    settings,
    rngSeed: seed >>> 0,
    totalShots: parseInt(settings.shots, 10),
    shotIndex: 0,
    attempts: [],
    aim: 0.5,
    height: 0.4,
    fakeDir: 0.5,
    goalieReact,
    phase: "aim",
    lastResult: "",
    goals: 0,
  };
}

export function reducer(state: HockeyShootoutState, action: HockeyShootoutAction): HockeyShootoutState {
  if (state.phase === "done") return state;

  if (action.type === "set-aim" && state.phase === "aim") {
    return { ...state, aim: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-height" && state.phase === "aim") {
    return { ...state, height: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-fake" && state.phase === "aim") {
    return { ...state, fakeDir: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "shoot" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const scored = shootoutResult(state.aim, state.height, state.fakeDir, state.goalieReact, seed1);
    const attempt: ShootoutAttempt = {
      aim: state.aim, height: state.height, fakeDir: state.fakeDir,
      goalieReact: state.goalieReact, scored,
    };
    const newAttempts = [...state.attempts, attempt];
    const newGoals = state.goals + (scored ? 1 : 0);
    const newShotIndex = state.shotIndex + 1;
    const done = newShotIndex >= state.totalShots;

    const rng = mulberry32(seed2);
    const nextGoalieReact = rng() * 0.4 + 0.3;

    return {
      ...state,
      rngSeed: seed2,
      attempts: newAttempts,
      goals: newGoals,
      shotIndex: newShotIndex,
      goalieReact: nextGoalieReact,
      lastResult: scored ? "GOAL!" : "SAVED!",
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: HockeyShootoutState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.round((state.goals / state.totalShots) * 1000) };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SoccerPenaltySettings {
  kicks: "5" | "10";
}

export interface PenaltyKick {
  aim: number;     // 0..1 horizontal (0=far left, 1=far right)
  height: number;  // 0..1 vertical (0=ground, 1=crossbar)
  power: number;   // 0..1
  keeperSide: number; // 0..1 where keeper dives
  scored: boolean;
}

export interface SoccerPenaltyState {
  settings: SoccerPenaltySettings;
  rngSeed: number;
  totalKicks: number;
  kickIndex: number;
  kicks: PenaltyKick[];
  aim: number;
  height: number;
  power: number;
  keeperSide: number;
  phase: "aim" | "result" | "done";
  lastResult: string;
  goals: number;
}

export type SoccerPenaltyAction =
  | { type: "set-aim"; value: number }
  | { type: "set-height"; value: number }
  | { type: "set-power"; value: number }
  | { type: "kick" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function penaltyResult(aim: number, height: number, power: number, keeperSide: number, seed: number): boolean {
  const rng = mulberry32(seed);
  // Keeper covers middle more than extremes
  const keeperReach = 0.22 + (rng() * 0.06);
  const keeperCenter = keeperSide;
  const distFromKeeper = Math.abs(aim - keeperCenter);
  if (distFromKeeper < keeperReach && height < 0.7) return false;
  // Off-target check
  const offTarget = aim < 0.04 || aim > 0.96 || height > 1.0 || (power < 0.3 && height > 0.8);
  if (offTarget) return false;
  return true;
}

export function initialState(seed: number, settings: SoccerPenaltySettings): SoccerPenaltyState {
  const rng = mulberry32(seed);
  const keeperSide = rng() * 0.5 + 0.25; // biased to middle
  return {
    settings,
    rngSeed: seed >>> 0,
    totalKicks: parseInt(settings.kicks, 10),
    kickIndex: 0,
    kicks: [],
    aim: 0.5,
    height: 0.3,
    power: 0.75,
    keeperSide,
    phase: "aim",
    lastResult: "",
    goals: 0,
  };
}

export function reducer(state: SoccerPenaltyState, action: SoccerPenaltyAction): SoccerPenaltyState {
  if (state.phase === "done") return state;

  if (action.type === "set-aim" && state.phase === "aim") {
    return { ...state, aim: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-height" && state.phase === "aim") {
    return { ...state, height: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "kick" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const scored = penaltyResult(state.aim, state.height, state.power, state.keeperSide, seed1);
    const kick: PenaltyKick = {
      aim: state.aim, height: state.height, power: state.power,
      keeperSide: state.keeperSide, scored,
    };
    const newKicks = [...state.kicks, kick];
    const newGoals = state.goals + (scored ? 1 : 0);
    const newKickIndex = state.kickIndex + 1;
    const done = newKickIndex >= state.totalKicks;

    const rng = mulberry32(seed2);
    const nextKeeperSide = rng() * 0.5 + 0.25;

    return {
      ...state,
      rngSeed: seed2,
      kicks: newKicks,
      goals: newGoals,
      kickIndex: newKickIndex,
      keeperSide: nextKeeperSide,
      lastResult: scored ? "GOAL!" : "SAVED!",
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: SoccerPenaltyState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.round((state.goals / state.totalKicks) * 1000) };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Darts501Settings {
  startScore: "301" | "501";
}

export interface DartThrow {
  aim: number;     // 0..1 horizontal (0.5=center)
  height: number;  // 0..1 vertical (0.5=center/bullseye)
  power: number;   // 0..1 (affects scatter)
  sector: number;  // 1..20 or bull/bull25
  multiplier: number; // 1, 2 (double), 3 (triple)
  points: number;
}

export interface Darts501State {
  settings: Darts501Settings;
  rngSeed: number;
  startScore: number;
  remaining: number;
  dartsThrown: number;
  throws: DartThrow[];
  aim: number;
  height: number;
  power: number;
  phase: "aim" | "result" | "done" | "bust";
  lastResult: string;
  lastPoints: number;
}

export type Darts501Action =
  | { type: "set-aim"; value: number }
  | { type: "set-height"; value: number }
  | { type: "set-power"; value: number }
  | { type: "throw" }
  | { type: "next" };

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function throwDart(aim: number, height: number, power: number, seed: number): { sector: number; multiplier: number; points: number } {
  const rng = mulberry32(seed);
  // Accuracy: high power = low scatter; centered aim/height = bullseye area
  const accuracy = power * 0.7 + 0.3;
  const scatter = (1 - accuracy) * 0.3;
  const dx = (aim - 0.5) + (rng() - 0.5) * scatter * 2;
  const dy = (height - 0.5) + (rng() - 0.5) * scatter * 2;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Bullseye zones
  if (dist < 0.04) return { sector: 25, multiplier: 2, points: 50 };
  if (dist < 0.09) return { sector: 25, multiplier: 1, points: 25 };

  // Sector calculation
  const angle = Math.atan2(dy, dx);
  const sectorIdx = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 20) % 20;
  const sector = SECTORS[sectorIdx] ?? 1;

  // Ring zone
  let multiplier = 1;
  if (dist > 0.38 && dist < 0.42) multiplier = 2;      // double ring
  else if (dist > 0.22 && dist < 0.27) multiplier = 3;  // triple ring
  else if (dist > 0.44) multiplier = 0; // miss board

  const points = multiplier === 0 ? 0 : sector * multiplier;
  return { sector, multiplier, points };
}

export function initialState(seed: number, settings: Darts501Settings): Darts501State {
  const start = parseInt(settings.startScore, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    startScore: start,
    remaining: start,
    dartsThrown: 0,
    throws: [],
    aim: 0.5,
    height: 0.5,
    power: 0.75,
    phase: "aim",
    lastResult: "",
    lastPoints: 0,
  };
}

export function reducer(state: Darts501State, action: Darts501Action): Darts501State {
  if (state.phase === "done" || state.phase === "bust") {
    if (action.type === "next" && state.phase === "bust") {
      return { ...state, phase: "aim" };
    }
    return state;
  }

  if (action.type === "set-aim" && state.phase === "aim") {
    return { ...state, aim: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-height" && state.phase === "aim") {
    return { ...state, height: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "throw" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const { sector, multiplier, points } = throwDart(state.aim, state.height, state.power, seed1);
    const newRemaining = state.remaining - points;
    const t: DartThrow = { aim: state.aim, height: state.height, power: state.power, sector, multiplier, points };
    const newThrows = [...state.throws, t];
    const newDarts = state.dartsThrown + 1;

    const isBust = newRemaining < 0 || newRemaining === 1;
    const isDone = newRemaining === 0;

    const multLabel = multiplier === 2 ? "D" : multiplier === 3 ? "T" : "";
    const sectorLabel = sector === 25 && multiplier === 2 ? "Bull" : sector === 25 ? "25" : `${multLabel}${sector}`;
    const msg = points === 0 ? "Miss!" : `${sectorLabel} — ${points} pts`;

    return {
      ...state,
      rngSeed: seed2,
      remaining: isBust ? state.remaining : newRemaining,
      dartsThrown: newDarts,
      throws: newThrows,
      lastResult: isBust ? `BUST! (${points} pts)` : msg,
      lastPoints: points,
      phase: isDone ? "done" : isBust ? "bust" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: Darts501State): { score: number } | null {
  if (state.phase !== "done") return null;
  // Fewer darts = better score. Min realistic is 9 (nine-dart finish for 501)
  const efficiency = Math.max(0, 1 - (state.dartsThrown - 9) / 50);
  return { score: Math.round(efficiency * 1000) };
}

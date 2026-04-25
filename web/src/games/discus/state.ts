import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiscusSettings {
  throws: "3" | "6";
}

export interface DiscusThrow {
  spin: number;    // 0..1 rotational speed
  angle: number;   // 0..1 release angle (ideal ~0.5 = 35 degrees)
  release: number; // 0..1 release point (ideal ~0.75 for smooth exit)
  wind: number;
  distance: number;
  foul: boolean;
}

export interface DiscusState {
  settings: DiscusSettings;
  rngSeed: number;
  totalThrows: number;
  throwIndex: number;
  throws: DiscusThrow[];
  spin: number;
  angle: number;
  release: number;
  wind: number;
  phase: "aim" | "result" | "done";
  lastResult: string;
  bestDistance: number;
}

export type DiscusAction =
  | { type: "set-spin"; value: number }
  | { type: "set-angle"; value: number }
  | { type: "set-release"; value: number }
  | { type: "throw" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function throwDistance(spin: number, angle: number, release: number, wind: number, seed: number): { distance: number; foul: boolean } {
  const rng = mulberry32(seed);
  // Foul if release > 0.92 (out of sector)
  const foul = release > 0.92;
  if (foul) return { distance: 0, foul: true };
  const spinFactor = spin;
  const angleFactor = 1 - Math.abs(angle - 0.5) / 0.5;
  const releaseFactor = Math.min(1, release / 0.75);
  const windBonus = wind * 2;
  const noise = (rng() - 0.5) * 3;
  const dist = Math.max(10, 35 + spinFactor * 25 + angleFactor * 18 + releaseFactor * 12 + windBonus + noise);
  return { distance: Math.round(dist * 10) / 10, foul: false };
}

export function initialState(seed: number, settings: DiscusSettings): DiscusState {
  const rng = mulberry32(seed);
  const wind = (rng() - 0.5) * 4;
  return {
    settings,
    rngSeed: seed >>> 0,
    totalThrows: parseInt(settings.throws, 10),
    throwIndex: 0,
    throws: [],
    spin: 0.7,
    angle: 0.5,
    release: 0.75,
    wind,
    phase: "aim",
    lastResult: "",
    bestDistance: 0,
  };
}

export function reducer(state: DiscusState, action: DiscusAction): DiscusState {
  if (state.phase === "done") return state;

  if (action.type === "set-spin" && state.phase === "aim") {
    return { ...state, spin: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-release" && state.phase === "aim") {
    return { ...state, release: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "throw" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const { distance, foul } = throwDistance(state.spin, state.angle, state.release, state.wind, seed1);
    const t: DiscusThrow = { spin: state.spin, angle: state.angle, release: state.release, wind: state.wind, distance, foul };
    const newThrows = [...state.throws, t];
    const newBest = foul ? state.bestDistance : Math.max(state.bestDistance, distance);
    const newIndex = state.throwIndex + 1;
    const done = newIndex >= state.totalThrows;

    const rng = mulberry32(seed2);
    const nextWind = (rng() - 0.5) * 4;

    return {
      ...state,
      rngSeed: seed2,
      throws: newThrows,
      bestDistance: newBest,
      throwIndex: newIndex,
      wind: nextWind,
      lastResult: foul ? "FOUL! Out of sector!" : `${distance.toFixed(1)} m`,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: DiscusState): { score: number } | null {
  if (state.phase !== "done") return null;
  // World record ~74m, score 1000 at 65m+
  const score = Math.round(Math.min(1000, (state.bestDistance / 65) * 1000));
  return { score };
}

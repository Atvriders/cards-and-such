import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MiniGolfSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Hole {
  par: number;       // always 3
  strokes: number;
  completed: boolean;
}

export interface MiniGolfState {
  settings: MiniGolfSettings;
  rngSeed: number;
  holes: Hole[];
  currentHole: number;   // 0-8
  strokesThisHole: number;
  distanceToPin: number; // notional units, starts at ~80, 0 = holed out
  angle: number;         // 0..1, ideal varies by hole position
  power: number;         // 0..1, ideal varies by distance
  phase: "aim" | "result" | "hole-done" | "done";
  lastResult: string;
  totalStrokes: number;
  totalPar: number;      // always 27 (9 × 3)
}

export type MiniGolfAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "putt" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function idealPower(dist: number): number {
  // More distance needs more power; full 80-unit shot ~ 0.7 power
  return Math.min(0.95, (dist / 80) * 0.7);
}

function puttResult(angle: number, power: number, distance: number, seed: number, difficulty: "easy" | "medium" | "hard"): number {
  // Returns distance remaining after putt (0 = holed)
  const rng = mulberry32(seed);
  const tol = difficulty === "easy" ? 0.38 : difficulty === "medium" ? 0.26 : 0.15;
  const ideal = idealPower(distance);
  const angleDev = Math.abs(angle - 0.5);
  const powerDev = Math.abs(power - ideal);
  const quality = Math.max(0, 1 - angleDev / tol - powerDev / 0.35);

  // Distance traveled toward hole
  const traveled = distance * quality * (0.7 + rng() * 0.6);
  const lateral = (angleDev * 2 + (rng() - 0.5) * 0.3) * distance * 0.5;

  const remaining = Math.max(0, Math.sqrt(Math.pow(distance - traveled, 2) + Math.pow(lateral, 2)));
  return remaining;
}

export function initialState(seed: number, settings: MiniGolfSettings): MiniGolfState {
  return {
    settings,
    rngSeed: seed >>> 0,
    holes: Array.from({ length: 9 }, () => ({ par: 3, strokes: 0, completed: false })),
    currentHole: 0,
    strokesThisHole: 0,
    distanceToPin: 80,
    angle: 0.5,
    power: 0.7,
    phase: "aim",
    lastResult: "",
    totalStrokes: 0,
    totalPar: 27,
  };
}

export function reducer(state: MiniGolfState, action: MiniGolfAction): MiniGolfState {
  if (state.phase === "done") return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "putt" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const newSeed = nextSeed(seed1);
    const remaining = puttResult(state.angle, state.power, state.distanceToPin, seed1, state.settings.difficulty);
    const holed = remaining < 2; // within 2 units = holed
    const newStrokes = state.strokesThisHole + 1;
    const maxStrokes = 8; // max strokes per hole before forced finish

    let lastResult = "";
    let phase: MiniGolfState["phase"] = "result";
    let newDist = holed ? 0 : remaining;

    if (holed) {
      const par = 3;
      const diff = newStrokes - par;
      const label = diff <= -2 ? "Eagle!" : diff === -1 ? "Birdie!" : diff === 0 ? "Par" : diff === 1 ? "Bogey" : `+${diff}`;
      lastResult = `Holed out in ${newStrokes} strokes — ${label}!`;
      phase = "hole-done";
    } else if (newStrokes >= maxStrokes) {
      lastResult = `Max strokes reached. Distance remaining: ${newDist.toFixed(1)} units.`;
      phase = "hole-done";
      newDist = 0; // forced completion
    } else {
      lastResult = `${remaining.toFixed(1)} units to pin.`;
    }

    const newHoles = state.holes.map((h, i) =>
      i === state.currentHole ? { ...h, strokes: newStrokes, completed: holed || newStrokes >= maxStrokes } : h
    );

    return {
      ...state,
      rngSeed: newSeed,
      holes: newHoles,
      strokesThisHole: newStrokes,
      distanceToPin: newDist,
      lastResult,
      phase,
      totalStrokes: state.totalStrokes + 1,
    };
  }

  if (action.type === "next") {
    if (state.phase === "result") return { ...state, phase: "aim" };
    if (state.phase === "hole-done") {
      const nextHole = state.currentHole + 1;
      if (nextHole >= 9) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentHole: nextHole,
        strokesThisHole: 0,
        distanceToPin: 60 + nextHole * 5, // each hole slightly longer
        phase: "aim",
        lastResult: "",
      };
    }
  }

  return state;
}

export function isTerminal(state: MiniGolfState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Lower strokes = better. Par = 27. Score relative to par.
  const vspar = state.totalPar - state.totalStrokes; // positive = under par
  return { score: Math.max(0, 500 + vspar * 50) };
}

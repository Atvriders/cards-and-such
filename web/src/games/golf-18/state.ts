import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Golf18Settings {
  difficulty: "easy" | "medium" | "hard";
}

export type Club = "driver" | "iron" | "wedge" | "putter";
export type Terrain = "tee" | "fairway" | "rough" | "sand" | "water" | "green";

export const CLUB_DISTANCE: Record<Club, number> = {
  driver: 200,
  iron: 140,
  wedge: 80,
  putter: 30,
};

// 18 holes with par data
const HOLE_PARS = [4,4,3,5,4,3,4,5,4, 4,3,5,4,4,3,5,4,4]; // total par 72

export interface HoleRecord {
  par: number;
  strokes: number;
  completed: boolean;
}

export interface Golf18State {
  settings: Golf18Settings;
  rngSeed: number;
  holes: HoleRecord[];
  currentHole: number;
  strokesThisHole: number;
  distanceToPin: number;
  terrain: Terrain;
  club: Club;
  angle: number;
  power: number;
  phase: "select-club" | "aim" | "result" | "hole-done" | "done";
  lastResult: string;
  totalStrokes: number;
}

export type Golf18Action =
  | { type: "select-club"; club: Club }
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "swing" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function terrainMultiplier(t: Terrain): number {
  if (t === "fairway") return 1.0;
  if (t === "rough") return 0.75;
  if (t === "sand") return 0.55;
  if (t === "tee") return 1.05;
  if (t === "green") return 0.4;
  return 0; // water = no distance
}

function nextTerrain(remaining: number, seed: number): Terrain {
  const rng = mulberry32(seed);
  if (remaining > 100) {
    const r = rng();
    if (r < 0.5) return "fairway";
    if (r < 0.75) return "rough";
    if (r < 0.85) return "sand";
    return "fairway";
  }
  if (remaining > 30) {
    const r = rng();
    return r < 0.7 ? "fairway" : "rough";
  }
  return "green";
}

function swingResult(
  angle: number, power: number, distance: number, club: Club, terrain: Terrain, seed: number, difficulty: "easy" | "medium" | "hard"
): { remaining: number; newTerrain: Terrain; waterHazard: boolean } {
  const rng = mulberry32(seed);
  const tol = difficulty === "easy" ? 0.38 : difficulty === "medium" ? 0.26 : 0.14;
  const angleDev = Math.abs(angle - 0.5);
  const powerDev = Math.abs(power - 0.75);
  const quality = Math.max(0, 1 - angleDev / tol - powerDev / 0.5);

  const maxReach = CLUB_DISTANCE[club] * terrainMultiplier(terrain);
  const traveled = maxReach * quality * (0.65 + rng() * 0.55) * power;
  const lateral = angleDev * maxReach * 0.6 + (rng() - 0.5) * 15;

  // Water hazard chance on poor shots over water-prone zones
  const waterChance = (angleDev > 0.25 || power < 0.3) && distance > 80 ? rng() < 0.15 : false;
  if (waterChance) {
    return { remaining: distance + 20, newTerrain: "rough", waterHazard: true };
  }

  const rawRemaining = Math.max(0, Math.sqrt(Math.pow(distance - traveled, 2) + Math.pow(lateral, 2)));
  const remaining = Math.max(0, rawRemaining);
  const newTerrain = remaining < 2 ? "green" : nextTerrain(remaining, seed + 1);

  return { remaining, newTerrain, waterHazard: false };
}

function holeDistance(holeIndex: number): number {
  const pars = HOLE_PARS;
  const p = pars[holeIndex] ?? 4;
  if (p === 3) return 130 + holeIndex * 2;
  if (p === 5) return 360 + holeIndex * 3;
  return 260 + holeIndex * 3;
}

export function initialState(seed: number, settings: Golf18Settings): Golf18State {
  const dist = holeDistance(0);
  return {
    settings,
    rngSeed: seed >>> 0,
    holes: HOLE_PARS.map((par) => ({ par, strokes: 0, completed: false })),
    currentHole: 0,
    strokesThisHole: 0,
    distanceToPin: dist,
    terrain: "tee",
    club: "driver",
    angle: 0.5,
    power: 0.75,
    phase: "select-club",
    lastResult: `Hole 1 — Par ${HOLE_PARS[0]} — ${dist} yds`,
    totalStrokes: 0,
  };
}

export function reducer(state: Golf18State, action: Golf18Action): Golf18State {
  if (state.phase === "done") return state;

  if (action.type === "select-club" && state.phase === "select-club") {
    return { ...state, club: action.club, phase: "aim" };
  }

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "swing" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const newSeed = nextSeed(seed1);
    const { remaining, newTerrain, waterHazard } = swingResult(
      state.angle, state.power, state.distanceToPin, state.club, state.terrain, seed1, state.settings.difficulty
    );

    const newStrokes = state.strokesThisHole + 1 + (waterHazard ? 1 : 0); // water = penalty stroke
    const holed = remaining < 2;
    const maxStrokes = 12;

    let lastResult = "";
    let phase: Golf18State["phase"] = "result";

    if (waterHazard) {
      lastResult = `Water hazard! +1 penalty stroke. Back to ${remaining.toFixed(0)} yds.`;
    } else if (holed) {
      const par = state.holes[state.currentHole]!.par;
      const diff = newStrokes - par;
      const label = diff <= -2 ? "Eagle!" : diff === -1 ? "Birdie!" : diff === 0 ? "Par" : `+${diff}`;
      lastResult = `HOLED! ${newStrokes} strokes — ${label}`;
      phase = "hole-done";
    } else if (newStrokes >= maxStrokes) {
      lastResult = `Max strokes — ${remaining.toFixed(0)} yds left.`;
      phase = "hole-done";
    } else {
      lastResult = `${remaining.toFixed(0)} yds to pin | Terrain: ${newTerrain}`;
    }

    const newHoles = state.holes.map((h, i) =>
      i === state.currentHole ? { ...h, strokes: newStrokes, completed: holed || newStrokes >= maxStrokes } : h
    );

    return {
      ...state,
      rngSeed: newSeed,
      holes: newHoles,
      strokesThisHole: newStrokes,
      distanceToPin: holed ? 0 : remaining,
      terrain: holed ? "green" : newTerrain,
      totalStrokes: state.totalStrokes + 1 + (waterHazard ? 1 : 0),
      lastResult,
      phase,
    };
  }

  if (action.type === "next") {
    if (state.phase === "result") {
      return { ...state, phase: "select-club" };
    }
    if (state.phase === "hole-done") {
      const next = state.currentHole + 1;
      if (next >= 18) return { ...state, phase: "done" };
      const dist = holeDistance(next);
      return {
        ...state,
        currentHole: next,
        strokesThisHole: 0,
        distanceToPin: dist,
        terrain: "tee",
        club: "driver",
        phase: "select-club",
        lastResult: `Hole ${next + 1} — Par ${HOLE_PARS[next] ?? 4} — ${dist} yds`,
      };
    }
  }

  return state;
}

export function isTerminal(state: Golf18State): { score: number } | null {
  if (state.phase !== "done") return null;
  const totalPar = state.holes.reduce((s, h) => s + h.par, 0);
  const vspar = totalPar - state.totalStrokes;
  return { score: Math.max(0, 1000 + vspar * 30) };
}

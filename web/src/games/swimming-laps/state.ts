import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Swimming Laps: alternate key presses to swim, avoid obstacles

export type Stroke = "freestyle" | "butterfly" | "backstroke" | "breaststroke";

export interface Obstacle {
  id: number;
  laneOffset: number; // relative position -1, 0, 1
  distance: number;   // distance ahead on track 0-100
}

export interface SwimState {
  rngSeed: number;
  tick: number;
  maxTicks: number;
  lap: number;
  totalLaps: number;
  progress: number;    // 0-100 within current lap
  speed: number;       // current speed
  stamina: number;     // 0-100
  lane: number;        // 0, 1, 2
  stroke: Stroke;
  strokeCombo: number; // consecutive correct alternations
  lastKey: "L" | "R" | null;
  obstacles: Obstacle[];
  nextObstacleId: number;
  score: number;
  hits: number;
  phase: "playing" | "done";
}

const STROKE_SPEED: Record<Stroke, number> = {
  freestyle: 1.2, butterfly: 1.5, backstroke: 1.0, breaststroke: 0.9,
};

const STROKES: Stroke[] = ["freestyle", "butterfly", "backstroke", "breaststroke"];

export function initialState(seed: number): SwimState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const idx = Math.floor(rng() * 4);
  return {
    rngSeed: nextSeed,
    tick: 0,
    maxTicks: 500,
    lap: 1,
    totalLaps: 5,
    progress: 0,
    speed: STROKE_SPEED[STROKES[idx] ?? "freestyle"],
    stamina: 100,
    lane: 1,
    stroke: STROKES[idx] ?? "freestyle",
    strokeCombo: 0,
    lastKey: null,
    obstacles: [],
    nextObstacleId: 0,
    score: 0,
    hits: 0,
    phase: "playing",
  };
}

export type SwimAction =
  | { type: "stroke"; key: "L" | "R" }
  | { type: "changeLane"; dir: -1 | 1 }
  | { type: "tick" };

export function reducer(state: SwimState, action: SwimAction): SwimState {
  if (state.phase === "done") return state;

  if (action.type === "stroke") {
    const correct = state.lastKey === null || state.lastKey !== action.key;
    const newCombo = correct ? state.strokeCombo + 1 : 0;
    const speedBoost = correct ? Math.min(0.2, newCombo * 0.02) : -0.1;
    const staminaCost = 2;
    const newStamina = Math.max(0, state.stamina - staminaCost);
    const newSpeed = Math.max(0.5, Math.min(3, STROKE_SPEED[state.stroke] + speedBoost));
    return {
      ...state,
      lastKey: action.key,
      strokeCombo: newCombo,
      speed: newSpeed,
      stamina: newStamina,
    };
  }

  if (action.type === "changeLane") {
    const newLane = Math.max(0, Math.min(2, state.lane + action.dir));
    return { ...state, lane: newLane };
  }

  // tick
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newTick = state.tick + 1;

  // move swimmer
  const staminaFactor = state.stamina > 50 ? 1.0 : 0.7;
  const newProgress = state.progress + state.speed * staminaFactor;
  const newStamina = Math.min(100, state.stamina + 0.5); // small recovery per tick

  // check lap completion
  let lap = state.lap;
  let progress = newProgress;
  if (progress >= 100) {
    lap += 1;
    progress = 0;
  }

  // move obstacles toward swimmer (decrease distance)
  const movedObstacles = state.obstacles
    .map(o => ({ ...o, distance: o.distance - state.speed * 2 }))
    .filter(o => o.distance > -5);

  // check collisions
  let hits = state.hits;
  let score = state.score;
  const postObstacles = movedObstacles.map(o => {
    if (o.distance < 5 && o.distance > -5 && o.laneOffset === 0) {
      // swimmer's lane
      if (state.lane === 1 + o.laneOffset || (o.laneOffset === 0 && state.lane === 1)) {
        hits++;
        score -= 20;
        return { ...o, distance: -10 }; // remove
      }
    }
    return o;
  }).filter(o => o.distance > -5);

  // spawn obstacles
  let nid = state.nextObstacleId;
  const finalObstacles = [...postObstacles];
  if (rng() > 0.85) {
    const laneOffArr: number[] = [-1, 0, 1];
    const laneOff: number = laneOffArr[Math.floor(rng() * 3) % 3] ?? 0;
    finalObstacles.push({ id: nid++, laneOffset: laneOff, distance: 100 });
  }

  const lapScore = lap > state.lap ? 50 : 0;
  const phase = (lap > state.totalLaps || newTick >= state.maxTicks) ? "done" : "playing";

  return {
    ...state,
    rngSeed: nextSeed,
    tick: newTick,
    lap: Math.min(state.totalLaps + 1, lap),
    progress,
    stamina: newStamina,
    obstacles: finalObstacles,
    nextObstacleId: nid,
    score: Math.max(0, score + lapScore + 1),
    hits,
    phase,
  };
}

export function isTerminal(state: SwimState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, Math.round(state.score / 3)) };
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pole Climbing: alternate L/R grips to climb a pole, dodge obstacles on the way up

export const POLE_HEIGHT = 100; // height units to climb

export interface Obstacle {
  id: number;
  height: number;   // position on pole (0 = bottom, POLE_HEIGHT = top)
  side: "left" | "right"; // blocks that arm
}

export interface PoleState {
  rngSeed: number;
  height: number;       // climber position 0-POLE_HEIGHT
  speed: number;        // current climb speed
  grip: "left" | "right" | null; // last grip used
  gripCombo: number;    // consecutive alternating grips
  energy: number;       // 0-100
  obstacles: Obstacle[];
  nextObstacleId: number;
  phase: "climbing" | "done";
  tick: number;
  score: number;
  falls: number;
}

export type PoleAction =
  | { type: "gripLeft" }
  | { type: "gripRight" }
  | { type: "tick" };

export function initialState(seed: number): PoleState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    height: 0,
    speed: 0,
    grip: null,
    gripCombo: 0,
    energy: 100,
    obstacles: [],
    nextObstacleId: 0,
    phase: "climbing",
    tick: 0,
    score: 0,
    falls: 0,
  };
}

export function reducer(state: PoleState, action: PoleAction): PoleState {
  if (state.phase === "done") return state;

  if (action.type === "gripLeft" || action.type === "gripRight") {
    const side: "left" | "right" = action.type === "gripLeft" ? "left" : "right";
    const alternated = state.grip !== null && state.grip !== side;
    const newCombo = alternated ? state.gripCombo + 1 : 0;
    const speedGain = alternated ? 0.3 + newCombo * 0.05 : 0.1;
    const newSpeed = Math.min(5, state.speed + speedGain);
    const newEnergy = Math.max(0, state.energy - 4);

    // check if this grip hits an obstacle at current height
    const hitObstacle = state.obstacles.some(
      o => o.side === side && Math.abs(o.height - state.height) < 5
    );
    if (hitObstacle) {
      return {
        ...state,
        grip: side,
        speed: Math.max(0, state.speed - 1.5),
        falls: state.falls + 1,
        energy: Math.max(0, state.energy - 10),
        gripCombo: 0,
      };
    }

    return {
      ...state,
      grip: side,
      gripCombo: newCombo,
      speed: newSpeed,
      energy: newEnergy,
    };
  }

  // tick
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newTick = state.tick + 1;

  // slide down if no energy
  const energyFactor = state.energy > 20 ? 1.0 : 0.4;
  const netClimb = state.speed * energyFactor;
  const newHeight = Math.min(POLE_HEIGHT, Math.max(0, state.height + netClimb));
  const newSpeed = Math.max(0, state.speed - 0.08); // gravity
  const newEnergy = Math.min(100, state.energy + 0.5);

  // spawn obstacles ahead
  const newObstacles = state.obstacles.filter(o => o.height > state.height - 5);
  let nid = state.nextObstacleId;
  if (rng() > 0.85 && newObstacles.length < 6) {
    const side: "left" | "right" = rng() > 0.5 ? "left" : "right";
    newObstacles.push({ id: nid++, height: state.height + 15 + Math.floor(rng() * 15), side });
  }

  const phase = newHeight >= POLE_HEIGHT ? "done" : "climbing";
  const scoreGain = phase === "done" ? Math.max(0, 100 - state.falls * 10) : 0;

  return {
    ...state,
    rngSeed: nextSeed,
    tick: newTick,
    height: newHeight,
    speed: newSpeed,
    energy: newEnergy,
    obstacles: newObstacles,
    nextObstacleId: nid,
    phase,
    score: state.score + scoreGain,
  };
}

export function isTerminal(state: PoleState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, state.score)) };
}

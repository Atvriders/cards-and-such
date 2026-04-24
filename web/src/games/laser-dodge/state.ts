import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Laser {
  id: number;
  axis: "h" | "v";
  // Fixed perpendicular coordinate (y for horizontal, x for vertical)
  fixedPos: number;
  // The laser segment spans from minCoord to maxCoord along the parallel axis
  minCoord: number;
  maxCoord: number;
  // Oscillation of fixedPos (the laser slides perpendicular to its direction)
  oscMin: number;
  oscMax: number;
  oscSpeed: number;
  oscDir: 1 | -1;
  color: string;
}

export interface LaserDodgeState {
  settings: { difficulty: "easy" | "normal" | "hard" };
  playerX: number;
  playerY: number;
  lasers: Laser[];
  score: number;
  elapsed: number;
  over: boolean;
  rng: () => number;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
}

export type LaserDodgeAction =
  | { type: "tick"; dt: number }
  | { type: "setPos"; x: number; y: number }
  | { type: "move"; dx: number; dy: number };

export const PLAYER_R = 0.03;

const LASER_COLORS = ["#ff3030", "#ff9900", "#ff30ff", "#30ffff"];

function makeLaser(rng: () => number, id: number, elapsed: number): Laser {
  const axis = rng() < 0.5 ? "h" : "v";
  const startFixed = 0.1 + rng() * 0.8;
  const span = 0.4 + rng() * 0.4;
  const minCoord = 0.05 + rng() * 0.3;
  const maxCoord = Math.min(minCoord + span, 0.95);
  const oscRange = 0.15 + rng() * 0.3;
  const oscMin = Math.max(0.05, startFixed - oscRange / 2);
  const oscMax = Math.min(0.95, startFixed + oscRange / 2);
  const speedBase = 0.12 + elapsed * 0.003;
  return {
    id,
    axis: axis as "h" | "v",
    fixedPos: startFixed,
    minCoord,
    maxCoord,
    oscMin,
    oscMax,
    oscSpeed: speedBase + rng() * 0.1,
    oscDir: rng() < 0.5 ? 1 : -1,
    color: LASER_COLORS[Math.floor(rng() * LASER_COLORS.length)]!,
  };
}

export function initialState(seed: number, s: { difficulty: "easy" | "normal" | "hard" }): LaserDodgeState {
  const rng = mulberry32(seed);
  const initCount = s.difficulty === "easy" ? 2 : s.difficulty === "hard" ? 5 : 3;
  const lasers = Array.from({ length: initCount }, (_, i) => makeLaser(rng, i, 0));
  return {
    settings: s,
    playerX: 0.5,
    playerY: 0.5,
    lasers,
    score: 0,
    elapsed: 0,
    over: false,
    rng,
    rngSeed: seed,
    nextId: initCount,
    spawnTimer: 0,
  };
}

function laserHitsPlayer(l: Laser, px: number, py: number): boolean {
  const halfW = 0.012; // visual half-thickness
  if (l.axis === "h") {
    if (px + PLAYER_R < l.minCoord || px - PLAYER_R > l.maxCoord) return false;
    return Math.abs(py - l.fixedPos) < halfW + PLAYER_R;
  } else {
    if (py + PLAYER_R < l.minCoord || py - PLAYER_R > l.maxCoord) return false;
    return Math.abs(px - l.fixedPos) < halfW + PLAYER_R;
  }
}

export function reducer(state: LaserDodgeState, action: LaserDodgeAction): LaserDodgeState {
  switch (action.type) {
    case "setPos": {
      if (state.over) return state;
      const px = Math.max(PLAYER_R, Math.min(1 - PLAYER_R, action.x));
      const py = Math.max(PLAYER_R, Math.min(1 - PLAYER_R, action.y));
      const hit = state.lasers.some((l) => laserHitsPlayer(l, px, py));
      return { ...state, playerX: px, playerY: py, over: hit };
    }

    case "move": {
      if (state.over) return state;
      const px = Math.max(PLAYER_R, Math.min(1 - PLAYER_R, state.playerX + action.dx));
      const py = Math.max(PLAYER_R, Math.min(1 - PLAYER_R, state.playerY + action.dy));
      const hit = state.lasers.some((l) => laserHitsPlayer(l, px, py));
      return { ...state, playerX: px, playerY: py, over: hit };
    }

    case "tick": {
      if (state.over) return state;
      const { dt } = action;
      const elapsed = state.elapsed + dt;

      // Move lasers
      const lasers = state.lasers.map((l) => {
        let pos = l.fixedPos + l.oscDir * l.oscSpeed * dt;
        let dir = l.oscDir;
        if (pos >= l.oscMax) { pos = l.oscMax; dir = -1; }
        if (pos <= l.oscMin) { pos = l.oscMin; dir = 1; }
        return { ...l, fixedPos: pos, oscDir: dir as 1 | -1 };
      });

      // Collision
      const hit = lasers.some((l) => laserHitsPlayer(l, state.playerX, state.playerY));

      // Spawn new lasers periodically
      let { spawnTimer, nextId } = state;
      const spawnInterval = Math.max(8 - elapsed * 0.05, 3);
      spawnTimer += dt;
      const newLasers = [...lasers];
      if (spawnTimer >= spawnInterval && newLasers.length < 10) {
        newLasers.push(makeLaser(state.rng, nextId++, elapsed));
        spawnTimer -= spawnInterval;
      }

      const score = Math.floor(elapsed * 10);
      return { ...state, lasers: newLasers, elapsed, score, over: hit, spawnTimer, nextId };
    }

    default:
      return state;
  }
}

export function isTerminal(state: LaserDodgeState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Obstacle {
  id: number;
  x: number;  // 0..1
  y: number;  // 0..1
  w: number;
  h: number;
}

export interface PlaneDodgeState {
  settings: { difficulty: "easy" | "normal" | "hard" };
  planeX: number;
  planeY: number;
  obstacles: Obstacle[];
  score: number;
  distance: number;
  over: boolean;
  rng: () => number;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
  spawnInterval: number;
  scrollSpeed: number;
}

export type PlaneDodgeAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number; y: number };

const PLANE_W = 0.07;
const PLANE_H = 0.05;

export function initialState(seed: number, s: { difficulty: "easy" | "normal" | "hard" }): PlaneDodgeState {
  const rng = mulberry32(seed);
  const speed = s.difficulty === "easy" ? 0.3 : s.difficulty === "hard" ? 0.65 : 0.45;
  return {
    settings: s,
    planeX: 0.5,
    planeY: 0.5,
    obstacles: [],
    score: 0,
    distance: 0,
    over: false,
    rng,
    rngSeed: seed,
    nextId: 0,
    spawnTimer: 0,
    spawnInterval: 1.5,
    scrollSpeed: speed,
  };
}

function intersects(ax: number, ay: number, aw: number, ah: number,
                   bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function reducer(state: PlaneDodgeState, action: PlaneDodgeAction): PlaneDodgeState {
  switch (action.type) {
    case "move": {
      if (state.over) return state;
      const px = Math.max(0, Math.min(1 - PLANE_W, action.x - PLANE_W / 2));
      const py = Math.max(0, Math.min(1 - PLANE_H, action.y - PLANE_H / 2));
      return { ...state, planeX: px, planeY: py };
    }

    case "tick": {
      if (state.over) return state;
      const { dt } = action;
      const { scrollSpeed, rng } = state;

      // Move obstacles left
      let obstacles = state.obstacles
        .map((o) => ({ ...o, x: o.x - scrollSpeed * dt }))
        .filter((o) => o.x + o.w > -0.05);

      // Spawn new obstacles
      let { spawnTimer, nextId } = state;
      spawnTimer += dt;
      if (spawnTimer >= state.spawnInterval) {
        spawnTimer -= state.spawnInterval;
        // Randomize height gap pattern: full obstacle or gap-in-middle
        const kind = rng();
        if (kind < 0.5) {
          // Single wide obstacle with gap at random y
          const gapY = 0.15 + rng() * 0.5;
          const gapH = 0.2 + rng() * 0.15;
          // Top part
          if (gapY > 0.05) {
            obstacles.push({ id: nextId++, x: 1.02, y: 0, w: 0.06, h: gapY });
          }
          // Bottom part
          const bottomY = gapY + gapH;
          if (bottomY < 0.95) {
            obstacles.push({ id: nextId++, x: 1.02, y: bottomY, w: 0.06, h: 1 - bottomY });
          }
        } else {
          // Random scattered obstacle
          const w = 0.05 + rng() * 0.05;
          const h = 0.12 + rng() * 0.15;
          const y = rng() * (1 - h);
          obstacles.push({ id: nextId++, x: 1.02, y, w, h });
        }
      }

      // Collision check
      const planeX = state.planeX;
      const planeY = state.planeY;
      const hit = obstacles.some((o) =>
        intersects(planeX + 0.01, planeY + 0.01, PLANE_W - 0.02, PLANE_H - 0.02, o.x, o.y, o.w, o.h)
      );

      const distance = state.distance + scrollSpeed * dt;
      const score = Math.floor(distance * 100);
      const newSpeed = Math.min(state.scrollSpeed + 0.005 * dt, 1.5);

      return {
        ...state,
        obstacles,
        spawnTimer,
        nextId,
        distance,
        score,
        scrollSpeed: newSpeed,
        over: hit,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PlaneDodgeState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { PLANE_W, PLANE_H };

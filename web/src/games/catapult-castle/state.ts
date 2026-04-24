// ─── Catapult Castle ─────────────────────────────────────────────────────────
// Launch boulders at a castle wall. Euler integration, destructible blocks.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CatapultCastleSettings {
  boulders: "5" | "8" | "12";
}

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  destroyed: boolean;
  pts: number;
}

export interface Boulder {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface CatapultCastleState {
  settings: CatapultCastleSettings;
  totalBoulders: number;
  bouldersUsed: number;
  score: number;
  angle: number;    // degrees 10-75
  power: number;    // 20-100
  blocks: readonly Block[];
  boulder: Boulder | null;
  lastPts: number | null;
  over: boolean;
  rngSeed: number;
}

export type CatapultCastleAction =
  | { type: "setAngle"; angle: number }
  | { type: "setPower"; power: number }
  | { type: "launch" }
  | { type: "tick"; dt: number };

const GRAVITY = 0.35;

function buildCastle(seed: number): Block[] {
  const rng = mulberry32(seed);
  const blocks: Block[] = [];
  // Ground floor: 4 blocks
  for (let i = 0; i < 4; i++) {
    blocks.push({
      x: 0.6 + i * 0.09,
      y: 0.68,
      w: 0.08,
      h: 0.1,
      destroyed: false,
      pts: 10 + Math.floor(rng() * 10),
    });
  }
  // Second floor: 3 blocks
  for (let i = 0; i < 3; i++) {
    blocks.push({
      x: 0.64 + i * 0.09,
      y: 0.58,
      w: 0.08,
      h: 0.08,
      destroyed: false,
      pts: 20 + Math.floor(rng() * 10),
    });
  }
  // Top: 2 blocks
  for (let i = 0; i < 2; i++) {
    blocks.push({
      x: 0.68 + i * 0.09,
      y: 0.50,
      w: 0.08,
      h: 0.07,
      destroyed: false,
      pts: 30 + Math.floor(rng() * 20),
    });
  }
  // Tower turret
  blocks.push({ x: 0.72, y: 0.43, w: 0.06, h: 0.06, destroyed: false, pts: 50 });
  return blocks;
}

export function initialState(seed: number, settings: CatapultCastleSettings): CatapultCastleState {
  const totalBoulders = parseInt(settings.boulders, 10);
  return {
    settings,
    totalBoulders,
    bouldersUsed: 0,
    score: 0,
    angle: 45,
    power: 60,
    blocks: buildCastle(seed),
    boulder: null,
    lastPts: null,
    over: false,
    rngSeed: seed,
  };
}

export function reducer(state: CatapultCastleState, action: CatapultCastleAction): CatapultCastleState {
  if (state.over) return state;

  switch (action.type) {
    case "setAngle":
      if (state.boulder) return state;
      return { ...state, angle: Math.max(10, Math.min(75, action.angle)) };

    case "setPower":
      if (state.boulder) return state;
      return { ...state, power: Math.max(20, Math.min(100, action.power)) };

    case "launch": {
      if (state.boulder || state.bouldersUsed >= state.totalBoulders) return state;
      const rad = (state.angle * Math.PI) / 180;
      const speed = state.power * 0.007;
      return {
        ...state,
        boulder: {
          x: 0.07,
          y: 0.72,
          vx: Math.cos(rad) * speed,
          vy: -Math.sin(rad) * speed,
          active: true,
        },
        bouldersUsed: state.bouldersUsed + 1,
        lastPts: null,
      };
    }

    case "tick": {
      if (!state.boulder || !state.boulder.active) return state;
      const { dt } = action;
      let { x, y, vx, vy } = state.boulder;

      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      let hitPts = 0;
      const updatedBlocks = state.blocks.map(block => {
        if (block.destroyed) return block;
        // AABB collision with boulder (radius ~0.02)
        const boulderR = 0.025;
        const closestX = Math.max(block.x, Math.min(x, block.x + block.w));
        const closestY = Math.max(block.y, Math.min(y, block.y + block.h));
        const dx = x - closestX;
        const dy = y - closestY;
        if (dx * dx + dy * dy < boulderR * boulderR) {
          hitPts += block.pts;
          return { ...block, destroyed: true };
        }
        return block;
      });

      // Out of bounds or hit ground
      if (x > 1.1 || y > 0.82 || x < 0) {
        const allDone = state.bouldersUsed >= state.totalBoulders;
        const allDestroyed = updatedBlocks.every(b => b.destroyed);
        return {
          ...state,
          blocks: updatedBlocks,
          boulder: null,
          score: state.score + hitPts,
          lastPts: hitPts || 0,
          over: allDone || allDestroyed,
        };
      }

      return {
        ...state,
        blocks: updatedBlocks,
        boulder: { x, y, vx, vy, active: true },
        score: state.score + hitPts,
        ...(hitPts > 0 ? { lastPts: hitPts } : {}),
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CatapultCastleState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}

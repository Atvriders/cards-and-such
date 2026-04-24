import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
// Playfield is normalized 0..1 x 0..1
export const PLATFORM_COUNT = 5;
export const PLAYER_W = 0.04;
export const PLAYER_H = 0.06;
export const BARREL_RADIUS = 0.025;
export const GRAVITY = 1.2;
export const JUMP_VY = -0.7;

// Platform definitions: { y, xLeft, xRight, ladderX? }
export interface Platform {
  y: number;
  xLeft: number;
  xRight: number;
  ladderX: number | null; // ladder midpoint x for climbing up
}

export const PLATFORMS: readonly Platform[] = [
  { y: 0.90, xLeft: 0.05, xRight: 0.95, ladderX: 0.85 },
  { y: 0.72, xLeft: 0.05, xRight: 0.90, ladderX: 0.15 },
  { y: 0.54, xLeft: 0.10, xRight: 0.95, ladderX: 0.80 },
  { y: 0.36, xLeft: 0.05, xRight: 0.90, ladderX: 0.20 },
  { y: 0.18, xLeft: 0.10, xRight: 0.95, ladderX: null },
];

export const GOAL_X = 0.5;
export const GOAL_Y = 0.10;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Barrel {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  onGround: boolean;
}

export interface BarrelJumperState {
  playerX: number;
  playerY: number;
  playerVy: number;
  onGround: boolean;
  onLadder: boolean;
  platformIdx: number; // which platform player is on
  barrels: readonly Barrel[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  paused: boolean;
  rngSeed: number;
  nextBarrelId: number;
  barrelSpawnTimer: number;
}

export type BarrelJumperAction =
  | { type: "tick"; dt: number }
  | { type: "move-left" }
  | { type: "move-right" }
  | { type: "jump" }
  | { type: "climb" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): BarrelJumperState {
  return {
    playerX: 0.10,
    playerY: PLATFORMS[0]!.y - PLAYER_H,
    playerVy: 0,
    onGround: true,
    onLadder: false,
    platformIdx: 0,
    barrels: [],
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    paused: false,
    rngSeed: seed,
    nextBarrelId: 0,
    barrelSpawnTimer: 2,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function playerHitsBarrel(px: number, py: number, bx: number, by: number): boolean {
  const dx = Math.abs(px - bx);
  const dy = Math.abs(py + PLAYER_H / 2 - by);
  return dx < PLAYER_W / 2 + BARREL_RADIUS && dy < PLAYER_H / 2 + BARREL_RADIUS;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: BarrelJumperState, action: BarrelJumperAction): BarrelJumperState {
  switch (action.type) {
    case "pause": return { ...state, paused: true };
    case "resume": return { ...state, paused: false };

    case "move-left": {
      if (state.lost || state.won || state.onLadder) return state;
      const plat = PLATFORMS[state.platformIdx]!;
      const newX = Math.max(plat.xLeft + PLAYER_W / 2, state.playerX - 0.04);
      return { ...state, playerX: newX };
    }

    case "move-right": {
      if (state.lost || state.won || state.onLadder) return state;
      const plat = PLATFORMS[state.platformIdx]!;
      const newX = Math.min(plat.xRight - PLAYER_W / 2, state.playerX + 0.04);
      return { ...state, playerX: newX };
    }

    case "jump": {
      if (state.lost || state.won || !state.onGround || state.onLadder) return state;
      return { ...state, playerVy: JUMP_VY, onGround: false };
    }

    case "climb": {
      if (state.lost || state.won) return state;
      const plat = PLATFORMS[state.platformIdx]!;
      if (plat.ladderX === null) return state;
      // Must be near the ladder
      if (Math.abs(state.playerX - plat.ladderX) > 0.05) return state;
      // Climb to next platform
      const nextIdx = state.platformIdx + 1;
      if (nextIdx >= PLATFORM_COUNT) return state;
      const nextPlat = PLATFORMS[nextIdx]!;
      return {
        ...state,
        platformIdx: nextIdx,
        playerY: nextPlat.y - PLAYER_H,
        playerVy: 0,
        onGround: true,
        onLadder: false,
        playerX: plat.ladderX,
      };
    }

    case "tick": {
      if (state.paused || state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed);

      let { playerX, playerY, playerVy, onGround, platformIdx, score, lives } = state;
      let lost: boolean = state.lost;
      let won: boolean = state.won;

      // Apply gravity
      if (!onGround) {
        playerVy += GRAVITY * dt;
        playerY += playerVy * dt;
      }

      // Platform landing
      const plat = PLATFORMS[platformIdx]!;
      const platY = plat.y - PLAYER_H;
      if (playerY >= platY && playerVy >= 0) {
        playerY = platY;
        playerVy = 0;
        onGround = true;
        score += 1; // tiny score for staying alive
      }

      // Win: reach goal
      if (
        platformIdx === PLATFORM_COUNT - 1 &&
        Math.abs(playerX - GOAL_X) < 0.07 &&
        Math.abs(playerY - GOAL_Y) < 0.05
      ) {
        won = true;
      }

      // Spawn barrels from top-right
      let barrelSpawnTimer = state.barrelSpawnTimer - dt;
      let nextBarrelId = state.nextBarrelId;
      let barrels = state.barrels as Barrel[];

      if (barrelSpawnTimer <= 0) {
        barrels = [
          ...barrels,
          {
            id: nextBarrelId++,
            x: 0.90,
            y: PLATFORMS[PLATFORM_COUNT - 1]!.y - BARREL_RADIUS * 2 - 0.02,
            vy: 0,
            vx: -(0.18 + rng() * 0.1),
            onGround: false,
          },
        ];
        barrelSpawnTimer = 2 + rng();
      }

      // Move barrels
      barrels = barrels.map((b) => {
        let { x, y, vy, vx } = b;
        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        // Check each platform
        let ground = false;
        for (const p of PLATFORMS) {
          if (
            y + BARREL_RADIUS >= p.y - 0.005 &&
            y + BARREL_RADIUS <= p.y + 0.02 &&
            x >= p.xLeft &&
            x <= p.xRight &&
            vy >= 0
          ) {
            y = p.y - BARREL_RADIUS;
            vy = 0;
            ground = true;
            // Roll: keep vx
            break;
          }
        }

        // Barrel falls off left edge
        if (x < -0.05) return { ...b, x: -0.1, y: 2 }; // mark for removal

        return { ...b, x, y, vy, onGround: ground };
      }).filter((b) => b.y < 1.1 && b.x > -0.08);

      // Barrel-player collision
      let invincibleFrames = state.lives; // reuse lives as dirty-hit marker
      for (const b of barrels) {
        if (playerHitsBarrel(playerX, playerY, b.x, b.y)) {
          lives -= 1;
          if (lives <= 0) lost = true;
          // Reset player
          playerX = 0.10;
          playerY = PLATFORMS[0]!.y - PLAYER_H;
          playerVy = 0;
          onGround = true;
          platformIdx = 0;
          barrels = [];
          break;
        }
      }
      void invincibleFrames;

      return {
        ...state,
        playerX,
        playerY,
        playerVy,
        onGround,
        platformIdx,
        barrels,
        score,
        lives,
        lost: lost as boolean,
        won: won as boolean,
        barrelSpawnTimer,
        nextBarrelId,
        rngSeed: state.rngSeed + 1,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: BarrelJumperState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 300 };
  if (state.lost) return { score: state.score };
  return null;
}

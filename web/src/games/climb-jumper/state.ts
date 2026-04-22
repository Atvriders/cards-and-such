import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Climb Jumper ─────────────────────────────────────────────────────────────
// Vertical-scrolling platform jumper. Gravity pulls down; player jumps on landing.

export type ClimbDifficulty = "easy" | "medium" | "hard";

export interface ClimbJumperSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Platform {
  id: number;
  x: number; // left edge, normalized [0,1]
  y: number; // top edge, normalized [0,1] in world coords
  width: number; // normalized
}

export interface ClimbJumperState {
  settings: ClimbJumperSettings;
  playerX: number; // center, normalized [0,1]
  playerY: number; // bottom of player, world coords
  playerVy: number; // vertical velocity (positive = up)
  playerVx: number; // horizontal velocity
  cameraY: number; // world Y corresponding to screen top (camera)
  platforms: readonly Platform[];
  score: number; // max height reached (integer world units)
  over: boolean;
  nextId: number;
  rngSeed: number;
  /** Player is moving left/right */
  movingLeft: boolean;
  movingRight: boolean;
}

export type ClimbJumperAction =
  | { type: "tick"; dt: number }
  | { type: "moveLeft"; on: boolean }
  | { type: "moveRight"; on: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY = -1.8; // units/sec^2 (negative = downward)
const JUMP_IMPULSE = 0.9; // units/sec upward
const PLAYER_HALF_W = 0.04;
const PLAYER_H = 0.07;
const PLATFORM_SCREEN_H = 1.0; // screen height in world units
const PLATFORM_WIDTH_MIN = 0.15;
const PLATFORM_WIDTH_MAX = 0.35;
const NUM_PLATFORMS_ON_SCREEN = 6;

const MOVE_SPEED: Record<ClimbDifficulty, number> = {
  easy: 0.35,
  medium: 0.45,
  hard: 0.6,
};

const PLATFORM_GAP: Record<ClimbDifficulty, number> = {
  easy: 0.12,
  medium: 0.16,
  hard: 0.22,
};

function rngRange(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

// ─── Platform generation ──────────────────────────────────────────────────────
function generatePlatforms(
  startY: number,
  count: number,
  gap: number,
  seed: number,
  startId: number,
): { platforms: Platform[]; nextSeed: number; nextId: number } {
  const rng = mulberry32(seed);
  const platforms: Platform[] = [];
  let y = startY;
  let id = startId;
  for (let i = 0; i < count; i++) {
    const w = rngRange(rng, PLATFORM_WIDTH_MIN, PLATFORM_WIDTH_MAX);
    const x = rngRange(rng, 0, 1 - w);
    platforms.push({ id: id++, x, y, width: w });
    y += gap + rngRange(rng, 0, gap * 0.5);
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { platforms, nextSeed, nextId: id };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: ClimbJumperSettings): ClimbJumperState {
  const gap = PLATFORM_GAP[settings.difficulty];
  // Starting platform under player
  const startPlatform: Platform = { id: 0, x: 0.3, y: -0.1, width: 0.4 };
  const { platforms, nextSeed, nextId } = generatePlatforms(
    gap,
    NUM_PLATFORMS_ON_SCREEN * 2,
    gap,
    seed,
    1,
  );

  return {
    settings,
    playerX: 0.5,
    playerY: 0, // world Y (0 = ground, increases upward)
    playerVy: JUMP_IMPULSE,
    playerVx: 0,
    cameraY: -0.2, // screen top in world coords
    platforms: [startPlatform, ...platforms],
    score: 0,
    over: false,
    nextId,
    rngSeed: nextSeed,
    movingLeft: false,
    movingRight: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: ClimbJumperState, action: ClimbJumperAction): ClimbJumperState {
  if (state.over) return state;

  switch (action.type) {
    case "moveLeft":
      return { ...state, movingLeft: action.on };
    case "moveRight":
      return { ...state, movingRight: action.on };

    case "tick": {
      const { dt } = action;
      const speed = MOVE_SPEED[state.settings.difficulty];
      const gap = PLATFORM_GAP[state.settings.difficulty];

      // ── Horizontal movement ────────────────────────────────────────────────
      let vx = 0;
      if (state.movingLeft) vx -= speed;
      if (state.movingRight) vx += speed;

      let px = state.playerX + vx * dt;
      // Wrap horizontally
      if (px - PLAYER_HALF_W < 0) px = PLAYER_HALF_W;
      if (px + PLAYER_HALF_W > 1) px = 1 - PLAYER_HALF_W;

      // ── Vertical movement (gravity) ────────────────────────────────────────
      let vy = state.playerVy + GRAVITY * dt;
      let py = state.playerY + vy * dt;

      // ── Platform landing detection ─────────────────────────────────────────
      let landed = false;
      if (vy < 0) {
        // Moving downward — check platforms
        for (const plat of state.platforms) {
          const platTop = plat.y;
          // Player bottom crosses platform top?
          if (
            state.playerY >= platTop &&
            py <= platTop &&
            px - PLAYER_HALF_W < plat.x + plat.width &&
            px + PLAYER_HALF_W > plat.x
          ) {
            py = platTop;
            vy = JUMP_IMPULSE; // auto-jump on landing
            landed = true;
            break;
          }
        }
      }

      // ── Camera follows player upward ───────────────────────────────────────
      // Camera Y = world Y of screen top
      // Screen shows from cameraY to cameraY + PLATFORM_SCREEN_H
      let cameraY = state.cameraY;
      const screenMid = cameraY + PLATFORM_SCREEN_H * 0.5;
      if (py > screenMid) {
        cameraY = py - PLATFORM_SCREEN_H * 0.5;
      }

      // ── Score = max world height reached ──────────────────────────────────
      const score = Math.max(state.score, Math.floor(py * 100));

      // ── Generate more platforms above ─────────────────────────────────────
      const highestPlat = state.platforms.reduce((max, p) => Math.max(max, p.y), 0);
      let platforms = state.platforms as Platform[];
      let nextId = state.nextId;
      let rngSeed = state.rngSeed;

      if (highestPlat < cameraY + PLATFORM_SCREEN_H * 2) {
        const result = generatePlatforms(
          highestPlat + gap,
          NUM_PLATFORMS_ON_SCREEN,
          gap,
          rngSeed,
          nextId,
        );
        platforms = [...platforms, ...result.platforms];
        nextId = result.nextId;
        rngSeed = result.nextSeed;
      }

      // ── Cull platforms below screen ────────────────────────────────────────
      platforms = platforms.filter((p) => p.y > cameraY - 0.2);

      // ── Game over: fell off screen bottom ─────────────────────────────────
      const playerScreenY = py - cameraY;
      const over = playerScreenY < -PLAYER_H * 2;

      return {
        ...state,
        playerX: px,
        playerY: py,
        playerVy: vy,
        playerVx: vx,
        cameraY,
        platforms,
        score,
        over,
        nextId,
        rngSeed,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ClimbJumperState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

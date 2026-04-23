import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Doodle Jump-like ─────────────────────────────────────────────────────────
// Vertical scroller: character auto-jumps on platforms. Move left/right to climb.

export interface DoodleJumpSettings {}

export interface Platform {
  id: number;
  x: number;    // [0,1] left edge normalized
  y: number;    // [0,1] position in world coords (0=start, grows upward)
  w: number;    // width [0,1]
}

export interface DoodleJumpState {
  settings: DoodleJumpSettings;
  playerX: number;     // center [0,1]
  playerY: number;     // world position; camera follows
  playerVx: number;
  playerVy: number;
  cameraY: number;     // top of visible area in world
  platforms: readonly Platform[];
  score: number;       // max height reached (integer)
  over: boolean;
  rngSeed: number;
  nextId: number;
  worldTop: number;    // highest generated platform Y
  dirInput: -1 | 0 | 1;
}

export type DoodleJumpAction =
  | { type: "tick"; dt: number }
  | { type: "dir"; dir: -1 | 0 | 1 };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY = 2.5;
const JUMP_VY = -1.5;
const MOVE_SPEED = 0.5;
const PLATFORM_W_MIN = 0.12;
const PLATFORM_W_MAX = 0.22;
const PLATFORM_DENSITY = 0.18; // spacing between platforms
const PLATFORM_H = 0.02;
const PLAYER_W = 0.06;
const PLAYER_H = 0.06;
const VIEW_H = 1.0;   // normalized view height (camera is 1 unit tall in world)

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function buildInitialPlatforms(seed: number): { platforms: Platform[]; rngSeed: number; nextId: number } {
  const platforms: Platform[] = [];
  // Starting platform directly under player
  platforms.push({ id: 1, x: 0.35, y: -0.05, w: 0.3 });
  let y = -0.05;
  let rngSeed = seed;
  let nextId = 2;
  for (let i = 0; i < 14; i++) {
    y -= PLATFORM_DENSITY + 0.04;
    const r1 = rng2(rngSeed);
    rngSeed = r1.next;
    const r2 = rng2(rngSeed);
    rngSeed = r2.next;
    const w = PLATFORM_W_MIN + r1.val * (PLATFORM_W_MAX - PLATFORM_W_MIN);
    const x = r2.val * (1 - w);
    platforms.push({ id: nextId++, x, y, w });
  }
  return { platforms, rngSeed, nextId };
}

export function initialState(seed: number, settings: DoodleJumpSettings): DoodleJumpState {
  const { platforms, rngSeed, nextId } = buildInitialPlatforms(seed);
  return {
    settings,
    playerX: 0.5,
    playerY: 0.0,
    playerVx: 0,
    playerVy: JUMP_VY,
    cameraY: -VIEW_H,
    platforms,
    score: 0,
    over: false,
    rngSeed,
    nextId,
    worldTop: platforms[platforms.length - 1]?.y ?? -0.05,
    dirInput: 0,
  };
}

export function reducer(state: DoodleJumpState, action: DoodleJumpAction): DoodleJumpState {
  if (state.over) return state;

  switch (action.type) {
    case "dir":
      return { ...state, dirInput: action.dir };

    case "tick": {
      const { dt } = action;

      // Horizontal movement with wrap
      let playerX = state.playerX + state.dirInput * MOVE_SPEED * dt;
      if (playerX < 0) playerX = 1;
      if (playerX > 1) playerX = 0;

      // Vertical physics
      const playerVy = state.playerVy + GRAVITY * dt;
      let playerY = state.playerY + playerVy * dt;

      // Platform collision (only when falling, i.e. playerVy > 0)
      let newVy = playerVy;
      let platforms = state.platforms as Platform[];
      if (playerVy > 0) {
        for (const p of platforms) {
          const playerBottom = playerY + PLAYER_H / 2;
          const prevBottom = state.playerY + PLAYER_H / 2;
          // Crossed platform from above
          if (
            prevBottom <= p.y &&
            playerBottom >= p.y &&
            playerX + PLAYER_W / 2 > p.x &&
            playerX - PLAYER_W / 2 < p.x + p.w
          ) {
            playerY = p.y - PLAYER_H / 2;
            newVy = JUMP_VY;
            break;
          }
        }
      }

      // Camera: keep player in upper 40% of view
      let cameraY = state.cameraY;
      if (playerY < cameraY + VIEW_H * 0.4) {
        cameraY = playerY - VIEW_H * 0.4;
      }

      // Score = max height climbed (world Y is negative = up)
      const score = Math.max(state.score, Math.floor(-playerY * 100));

      // Generate new platforms above worldTop
      let worldTop = state.worldTop;
      let rngSeed = state.rngSeed;
      let nextId = state.nextId;
      const newPlats: Platform[] = [];
      while (worldTop > cameraY - VIEW_H * 0.5) {
        const newY = worldTop - PLATFORM_DENSITY - 0.03;
        const r1 = rng2(rngSeed);
        rngSeed = r1.next;
        const r2 = rng2(rngSeed);
        rngSeed = r2.next;
        const w = PLATFORM_W_MIN + r1.val * (PLATFORM_W_MAX - PLATFORM_W_MIN);
        const x = r2.val * (1 - w);
        newPlats.push({ id: nextId++, x, y: newY, w });
        worldTop = newY;
      }
      platforms = [...platforms, ...newPlats];

      // Remove platforms too far below camera
      platforms = platforms.filter((p) => p.y < cameraY + VIEW_H + 0.2);

      // Game over: player fell below camera
      const over = playerY > cameraY + VIEW_H;

      return {
        ...state,
        playerX,
        playerY,
        playerVy: newVy,
        cameraY,
        platforms,
        score,
        over,
        rngSeed,
        nextId,
        worldTop,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DoodleJumpState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

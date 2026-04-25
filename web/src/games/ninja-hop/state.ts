import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NinjaHopSettings {
  speed: "slow" | "medium" | "fast";
}

export interface Platform {
  id: number;
  x: number;   // 0..1 normalized
  y: number;   // 0..1 normalized
  w: number;   // 0..1 normalized
}

export interface NinjaHopState {
  settings: NinjaHopSettings;
  playerX: number;
  playerY: number;
  playerVy: number;
  onGround: boolean;
  platforms: readonly Platform[];
  score: number;
  scrollY: number;   // how far we've climbed (normalized)
  over: boolean;
  rngSeed: number;
  rngCounter: number;
  nextPlatformId: number;
}

export type NinjaHopAction =
  | { type: "tick"; dt: number }
  | { type: "move"; dx: number }   // -1, 0, +1
  | { type: "jump" };

const GRAVITY = 2.2;
const JUMP_VY = -1.5;
const MOVE_SPEED = 0.5;
const PLATFORM_W = 0.18;
const PLATFORM_SPACING = 0.12;   // vertical gap between platforms

function speedScale(s: NinjaHopSettings["speed"]): number {
  return s === "slow" ? 0.75 : s === "fast" ? 1.3 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 998237)();
}

function generatePlatforms(seed: number, startCounter: number, count: number, startY: number): { platforms: Platform[]; counter: number; nextId: number } {
  const platforms: Platform[] = [];
  let counter = startCounter;
  let y = startY;
  for (let i = 0; i < count; i++) {
    const x = 0.05 + rngAt(seed, counter++) * (1 - PLATFORM_W - 0.1);
    const w = PLATFORM_W + rngAt(seed, counter++) * 0.08;
    platforms.push({ id: counter, x, y, w });
    y -= PLATFORM_SPACING;
  }
  return { platforms, counter, nextId: counter };
}

export function initialState(seed: number, settings: NinjaHopSettings): NinjaHopState {
  // Ground platform
  const ground: Platform = { id: 0, x: 0.3, y: 0.88, w: 0.4 };
  const { platforms, counter, nextId } = generatePlatforms(seed, 1, 18, 0.76);
  return {
    settings,
    playerX: 0.5,
    playerY: 0.82,
    playerVy: 0,
    onGround: true,
    platforms: [ground, ...platforms],
    score: 0,
    scrollY: 0,
    over: false,
    rngSeed: seed,
    rngCounter: counter,
    nextPlatformId: nextId,
  };
}

export function reducer(state: NinjaHopState, action: NinjaHopAction): NinjaHopState {
  if (state.over) return state;

  switch (action.type) {
    case "jump": {
      if (!state.onGround) return state;
      return { ...state, playerVy: JUMP_VY, onGround: false };
    }

    case "move": {
      const scale = speedScale(state.settings.speed);
      const newX = Math.max(0.02, Math.min(0.98, state.playerX + action.dx * MOVE_SPEED * scale * 0.016));
      return { ...state, playerX: newX };
    }

    case "tick": {
      const { dt } = action;
      const scale = speedScale(state.settings.speed);

      // Apply gravity
      let vy = state.playerVy + GRAVITY * dt * scale;
      let py = state.playerY + vy * dt * scale;
      // Clamp to ceiling only; floor triggers game over
      if (py < 0) { py = 0; vy = 0; }
      let px = state.playerX;
      let onGround = false;
      let score = state.score;
      let scrollY = state.scrollY;

      // Check platform collisions (only when falling)
      if (vy > 0) {
        for (const plat of state.platforms) {
          const platScreenY = plat.y + scrollY;
          if (
            px >= plat.x && px <= plat.x + plat.w &&
            state.playerY < platScreenY + 0.01 &&
            py >= platScreenY - 0.01
          ) {
            py = platScreenY;
            vy = 0;
            onGround = true;
            break;
          }
        }
      }

      // Scroll up when player rises above mid-screen
      if (py < 0.4) {
        const shift = 0.4 - py;
        py = 0.4;
        scrollY += shift;
        score = Math.max(score, Math.floor(scrollY * 200));
      }

      // Fall off bottom = game over
      const over = py > 1.0;

      // Generate more platforms
      let platforms = state.platforms as Platform[];
      let counter = state.rngCounter;
      let nextId = state.nextPlatformId;

      // Remove platforms that scrolled off the bottom
      platforms = platforms.filter((p) => p.y + scrollY < 1.1);

      // Add new platforms at the top
      const topY = Math.min(...platforms.map((p) => p.y));
      while (platforms.length < 20) {
        const x = 0.05 + rngAt(state.rngSeed, counter++) * (1 - PLATFORM_W - 0.1);
        const w = PLATFORM_W + rngAt(state.rngSeed, counter++) * 0.08;
        platforms.push({ id: nextId++, x, y: topY - PLATFORM_SPACING, w });
      }

      return {
        ...state,
        playerX: px,
        playerY: py,
        playerVy: vy,
        onGround,
        platforms,
        score,
        scrollY,
        over,
        rngCounter: counter,
        nextPlatformId: nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: NinjaHopState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

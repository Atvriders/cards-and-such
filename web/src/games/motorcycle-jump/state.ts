import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MotoSettings {
  ramps: "3" | "5" | "7";
}

export interface Ramp {
  x: number;
  width: number;
  height: number; // required jump height
  cleared: boolean;
}

export interface MotoState {
  settings: MotoSettings;
  bikeX: number;
  bikeY: number; // 0 = ground
  velocityY: number;
  speed: number;
  ramps: Ramp[];
  currentRamp: number; // index
  inAir: boolean;
  landed: boolean; // just landed on a ramp
  distance: number;
  score: number;
  lives: number;
  over: boolean;
  ticks: number;
  rngSeed: number;
  fieldW: number;
  groundY: number;
}

export type MotoAction =
  | { type: "tick" }
  | { type: "jump" }
  | { type: "throttle" };

const FIELD_W = 400;
const GROUND_Y = 200;
const GRAVITY = 0.8;
const BASE_SPEED = 3;

function generateRamps(count: number, seed: number): { ramps: Ramp[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const ramps: Ramp[] = [];
  let x = 200;
  for (let i = 0; i < count; i++) {
    const width = 40 + Math.floor(rng() * 40);
    const gap = 80 + Math.floor(rng() * 80);
    const height = 20 + Math.floor(rng() * (40 + i * 10));
    ramps.push({ x, width, height, cleared: false });
    x += width + gap;
  }
  return { ramps, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: MotoSettings): MotoState {
  const count = parseInt(settings.ramps, 10);
  const { ramps, nextSeed } = generateRamps(count, seed);
  return {
    settings,
    bikeX: 60,
    bikeY: 0,
    velocityY: 0,
    speed: BASE_SPEED,
    ramps,
    currentRamp: 0,
    inAir: false,
    landed: false,
    distance: 0,
    score: 0,
    lives: 3,
    over: false,
    ticks: 0,
    rngSeed: nextSeed,
    fieldW: FIELD_W,
    groundY: GROUND_Y,
  };
}

export function reducer(state: MotoState, action: MotoAction): MotoState {
  if (state.over) return state;

  switch (action.type) {
    case "throttle":
      return { ...state, speed: Math.min(state.speed + 0.5, 8) };

    case "jump": {
      if (state.inAir) return state;
      return { ...state, velocityY: state.speed * 1.5 + 2, inAir: true };
    }

    case "tick": {
      let { bikeX, bikeY, velocityY, inAir, speed, lives, score, distance, currentRamp } = state;
      const ramps = state.ramps.map((r) => ({ ...r }));

      // Move bike
      bikeX += speed;
      distance += speed;

      // Physics
      if (inAir) {
        bikeY += velocityY;
        velocityY -= GRAVITY;
        if (bikeY <= 0) {
          bikeY = 0;
          velocityY = 0;
          inAir = false;
        }
      }

      // Check ramp clearance: bike must be above ramp.height when passing over
      let landed = false;
      for (let i = 0; i < ramps.length; i++) {
        const r = ramps[i]!;
        if (r.cleared) continue;
        const bikeScreenX = bikeX % state.fieldW;
        const rampScreenX = r.x % state.fieldW;
        if (bikeX >= r.x && bikeX <= r.x + r.width) {
          if (!inAir && bikeY < r.height) {
            // Crashed into ramp
            lives--;
            if (lives <= 0) {
              return { ...state, bikeX, bikeY, velocityY, inAir, ramps, lives: 0, score, distance, over: true, ticks: state.ticks + 1 };
            }
            bikeX = r.x - 40;
            inAir = false;
            bikeY = 0;
            velocityY = 0;
          } else if (inAir && bikeY >= r.height) {
            // Cleared ramp
            r.cleared = true;
            score += 50 + Math.floor(r.height);
            landed = true;
          }
        }
      }

      // All ramps cleared
      const allCleared = ramps.every((r) => r.cleared);
      const over = allCleared;
      if (over) score += 200;

      return {
        ...state,
        bikeX,
        bikeY,
        velocityY,
        inAir,
        ramps,
        lives,
        score,
        distance,
        landed,
        over,
        ticks: state.ticks + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MotoState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

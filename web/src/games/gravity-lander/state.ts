// ─── Gravity Lander ───────────────────────────────────────────────────────────
// Lunar-lander-style. Land gently on the pad with low velocity and small angle.

export interface GravityLanderSettings {
  // No settings — single experience
}

export interface GravityLanderState {
  settings: GravityLanderSettings;
  // Ship state (normalized coords [0,1])
  x: number;
  y: number; // 0=top, 1=bottom
  vx: number;
  vy: number; // positive = downward
  angle: number; // radians, 0=up
  fuel: number; // 0-100
  // Controls
  thrusting: boolean;
  rotatingLeft: boolean;
  rotatingRight: boolean;
  // Game state
  over: boolean;
  won: boolean;
  score: number;
  // Landing pad (normalized)
  padX: number; // center
  padWidth: number;
  padY: number; // y coordinate of pad surface
  // Terrain: array of {x,y} vertices for the ground polygon
  terrain: readonly { x: number; y: number }[];
}

export type GravityLanderAction =
  | { type: "tick"; dt: number }
  | { type: "thrust"; on: boolean }
  | { type: "rotateLeft"; on: boolean }
  | { type: "rotateRight"; on: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────
const GRAVITY = 0.12; // units/sec^2 downward
const THRUST_POWER = 0.28; // units/sec^2 in ship direction
const ROTATE_SPEED = 2.2; // rad/sec
const MAX_LAND_VY = 0.12; // max safe downward speed
const MAX_LAND_VX = 0.08; // max safe horizontal speed
const MAX_LAND_ANGLE = 0.35; // max safe angle (radians, ~20°)
const INITIAL_FUEL = 100;
const FUEL_DRAIN = 25; // fuel/sec while thrusting

// ─── Terrain generation ───────────────────────────────────────────────────────
function generateTerrain(seed: number): {
  terrain: { x: number; y: number }[];
  padX: number;
  padWidth: number;
  padY: number;
} {
  // Simple LCG
  let s = seed;
  function rand() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  }

  const numPoints = 12;
  const padWidth = 0.14;
  const padSegment = 3 + Math.floor(rand() * (numPoints - 5)); // which segment holds the pad

  const xs: number[] = [];
  for (let i = 0; i <= numPoints; i++) {
    xs.push(i / numPoints);
  }

  const ys: number[] = [];
  for (let i = 0; i <= numPoints; i++) {
    if (i === padSegment || i === padSegment + 1) {
      // Will be overwritten by flat pad
      ys.push(0);
    } else {
      ys.push(0.65 + rand() * 0.2);
    }
  }

  // Create flat landing pad
  const padX = (xs[padSegment]! + xs[padSegment + 1]!) / 2;
  const padY = 0.72 + rand() * 0.1;
  ys[padSegment] = padY;
  ys[padSegment + 1] = padY;

  const terrain: { x: number; y: number }[] = xs.map((x, i) => ({ x, y: ys[i]! }));

  return { terrain, padX, padWidth, padY };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: GravityLanderSettings): GravityLanderState {
  const { terrain, padX, padWidth, padY } = generateTerrain(seed);

  return {
    settings,
    x: 0.5,
    y: 0.08,
    vx: 0,
    vy: 0,
    angle: 0,
    fuel: INITIAL_FUEL,
    thrusting: false,
    rotatingLeft: false,
    rotatingRight: false,
    over: false,
    won: false,
    score: 0,
    padX,
    padWidth,
    padY,
    terrain,
  };
}

// ─── Terrain height at x ──────────────────────────────────────────────────────
function terrainYAt(terrain: readonly { x: number; y: number }[], x: number): number {
  for (let i = 0; i < terrain.length - 1; i++) {
    const a = terrain[i]!;
    const b = terrain[i + 1]!;
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }
  return 0.8;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: GravityLanderState, action: GravityLanderAction): GravityLanderState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "thrust":
      return { ...state, thrusting: action.on };
    case "rotateLeft":
      return { ...state, rotatingLeft: action.on };
    case "rotateRight":
      return { ...state, rotatingRight: action.on };

    case "tick": {
      const { dt } = action;
      let { x, y, vx, vy, angle, fuel } = state;

      // ── Rotation ───────────────────────────────────────────────────────────
      if (state.rotatingLeft) angle -= ROTATE_SPEED * dt;
      if (state.rotatingRight) angle += ROTATE_SPEED * dt;
      angle = ((angle + Math.PI * 4) % (Math.PI * 2)); // keep in [0, 2π]

      // ── Thrust ────────────────────────────────────────────────────────────
      let thrusting = state.thrusting;
      if (thrusting && fuel > 0) {
        // Ship nose points in direction of angle; angle=0 means up (negative vy)
        vx += Math.sin(angle) * THRUST_POWER * dt;
        vy -= Math.cos(angle) * THRUST_POWER * dt;
        fuel = Math.max(0, fuel - FUEL_DRAIN * dt);
        if (fuel <= 0) thrusting = false;
      }

      // ── Gravity ────────────────────────────────────────────────────────────
      vy += GRAVITY * dt;

      // ── Move ───────────────────────────────────────────────────────────────
      x += vx * dt;
      y += vy * dt;

      // ── Wall bounds ────────────────────────────────────────────────────────
      if (x < 0.02) { x = 0.02; vx = Math.abs(vx) * 0.3; }
      if (x > 0.98) { x = 0.98; vx = -Math.abs(vx) * 0.3; }
      if (y < 0.01) { y = 0.01; vy = 0; }

      // ── Terrain collision ──────────────────────────────────────────────────
      const groundY = terrainYAt(state.terrain, x);
      if (y >= groundY) {
        // Check if on pad
        const onPad =
          Math.abs(x - state.padX) < state.padWidth / 2 &&
          Math.abs(groundY - state.padY) < 0.01;
        const normalizedAngle = angle > Math.PI ? angle - Math.PI * 2 : angle;
        const safeAngle = Math.abs(normalizedAngle) <= MAX_LAND_ANGLE;
        const safeVy = vy <= MAX_LAND_VY;
        const safeVx = Math.abs(vx) <= MAX_LAND_VX;

        if (onPad && safeVy && safeVx && safeAngle) {
          // Successful landing
          const landingQuality = Math.max(
            0,
            100 - Math.floor(vy * 200) - Math.floor(Math.abs(vx) * 150),
          );
          const fuelBonus = Math.floor(fuel * 2);
          return {
            ...state,
            x,
            y: groundY,
            vx: 0,
            vy: 0,
            angle,
            fuel,
            thrusting: false,
            won: true,
            score: fuelBonus + landingQuality,
          };
        } else {
          // Crash
          return {
            ...state,
            x,
            y: groundY,
            vx: 0,
            vy: 0,
            angle,
            fuel,
            thrusting: false,
            over: true,
            score: 0,
          };
        }
      }

      return { ...state, x, y, vx, vy, angle, fuel, thrusting };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GravityLanderState): { score: number } | null {
  if (state.over) return { score: 0 };
  if (state.won) return { score: state.score };
  return null;
}

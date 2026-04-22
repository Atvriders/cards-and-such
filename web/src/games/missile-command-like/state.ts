import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface City {
  x: number; // normalized [0,1]
  alive: boolean;
}

export interface Streak {
  id: number;
  x: number; // current x (normalized)
  y: number; // current y (normalized, 0=top 1=bottom)
  vx: number; // units/sec
  vy: number; // units/sec (positive = downward)
  dead: boolean;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
  radius: number; // current radius (normalized)
  maxRadius: number;
  growing: boolean;
}

export interface MissileCommandSettings {
  // no extra settings — wave progression is internal
}

export interface MissileCommandState {
  settings: MissileCommandSettings;
  cities: readonly City[];
  streaks: readonly Streak[];
  explosions: readonly Explosion[];
  wave: number;
  score: number;
  over: boolean;
  won: boolean;
  nextId: number;
  rngSeed: number;
  /** Ticks until next streak spawn */
  spawnCooldown: number;
  /** How many streaks remain to spawn in this wave */
  streaksLeft: number;
  /** Cursor position (normalized) */
  cursorX: number;
  cursorY: number;
}

export type MissileCommandAction =
  | { type: "tick"; dt: number }
  | { type: "aim"; x: number; y: number }
  | { type: "fire" };

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_CITIES = 6;
const GROUND_Y = 0.93;
const CITY_Y = GROUND_Y;
const BASE_STREAK_SPEED = 0.08;
const SPEED_PER_WAVE = 0.025;
const BASE_STREAKS_PER_WAVE = 8;
const STREAKS_INCREMENT = 4;
const EXPLOSION_GROW_SPEED = 0.6; // radius/sec
const EXPLOSION_SHRINK_SPEED = 0.3;
const MAX_EXPLOSION_RADIUS = 0.08;
const SPAWN_INTERVAL = 1.5; // seconds between spawns (decreases with wave)

function rngFloat(seed: number): { val: number; next: number } {
  const rng = mulberry32(seed);
  const val = rng();
  const next = Math.floor(rng() * 2 ** 31);
  return { val, next };
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, _settings: MissileCommandSettings): MissileCommandState {
  const cities: City[] = [];
  for (let i = 0; i < NUM_CITIES; i++) {
    cities.push({ x: (i + 0.5) / NUM_CITIES, alive: true });
  }

  return {
    settings: _settings,
    cities,
    streaks: [],
    explosions: [],
    wave: 1,
    score: 0,
    over: false,
    won: false,
    nextId: 1,
    rngSeed: seed,
    spawnCooldown: 0,
    streaksLeft: BASE_STREAKS_PER_WAVE,
    cursorX: 0.5,
    cursorY: 0.5,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function spawnStreak(state: MissileCommandState): MissileCommandState {
  if (state.streaksLeft <= 0) return state;

  let seed = state.rngSeed;
  let r1: { val: number; next: number };

  r1 = rngFloat(seed);
  const startX = r1.val;
  seed = r1.next;

  r1 = rngFloat(seed);
  // Target: a random city that is alive, or random x if all dead
  const aliveCities = state.cities.filter((c) => c.alive);
  let targetX: number;
  if (aliveCities.length > 0) {
    const idx = Math.floor(r1.val * aliveCities.length);
    targetX = aliveCities[Math.min(idx, aliveCities.length - 1)]!.x;
    seed = r1.next;
  } else {
    targetX = r1.val;
    seed = r1.next;
  }

  r1 = rngFloat(seed);
  seed = r1.next;
  const speedMult = 0.7 + r1.val * 0.6;
  const waveSpeed = BASE_STREAK_SPEED + (state.wave - 1) * SPEED_PER_WAVE;
  const speed = waveSpeed * speedMult;

  // Direction from top to target
  const dx = targetX - startX;
  const dy = GROUND_Y; // travel from y=0 to GROUND_Y
  const len = Math.sqrt(dx * dx + dy * dy);
  const vx = (dx / len) * speed;
  const vy = (dy / len) * speed;

  const streak: Streak = {
    id: state.nextId,
    x: startX,
    y: 0,
    vx,
    vy,
    dead: false,
  };

  return {
    ...state,
    rngSeed: seed,
    nextId: state.nextId + 1,
    streaks: [...state.streaks, streak],
    streaksLeft: state.streaksLeft - 1,
    spawnCooldown: Math.max(0.3, SPAWN_INTERVAL - (state.wave - 1) * 0.15),
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(
  state: MissileCommandState,
  action: MissileCommandAction,
): MissileCommandState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "aim":
      return { ...state, cursorX: action.x, cursorY: action.y };

    case "fire": {
      const explosion: Explosion = {
        id: state.nextId,
        x: state.cursorX,
        y: state.cursorY,
        radius: 0,
        maxRadius: MAX_EXPLOSION_RADIUS,
        growing: true,
      };
      return {
        ...state,
        nextId: state.nextId + 1,
        explosions: [...state.explosions, explosion],
      };
    }

    case "tick": {
      const { dt } = action;
      let { streaks, explosions, cities, score, nextId, spawnCooldown, streaksLeft, wave } = state;

      // ── Grow/shrink explosions ─────────────────────────────────────────────
      const updatedExplosions: Explosion[] = explosions
        .map((exp) => {
          if (exp.growing) {
            const newR = exp.radius + EXPLOSION_GROW_SPEED * dt;
            if (newR >= exp.maxRadius) {
              return { ...exp, radius: exp.maxRadius, growing: false };
            }
            return { ...exp, radius: newR };
          } else {
            const newR = exp.radius - EXPLOSION_SHRINK_SPEED * dt;
            return { ...exp, radius: Math.max(0, newR) };
          }
        })
        .filter((exp) => exp.radius > 0 || exp.growing);

      // ── Move streaks ───────────────────────────────────────────────────────
      let updatedStreaks: Streak[] = streaks.map((s) => ({
        ...s,
        x: s.x + s.vx * dt,
        y: s.y + s.vy * dt,
      }));

      // ── Explosion-streak collision ─────────────────────────────────────────
      const killedStreakIds = new Set<number>();
      for (const exp of updatedExplosions) {
        for (const s of updatedStreaks) {
          if (s.dead || killedStreakIds.has(s.id)) continue;
          const dx = exp.x - s.x;
          const dy = exp.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < exp.radius) {
            killedStreakIds.add(s.id);
            score += 10 * wave;
          }
        }
      }
      updatedStreaks = updatedStreaks.map((s) =>
        killedStreakIds.has(s.id) ? { ...s, dead: true } : s,
      );

      // ── Streaks reaching the ground ────────────────────────────────────────
      let updatedCities = cities as City[];
      const reachedGround: number[] = [];
      updatedStreaks = updatedStreaks.map((s) => {
        if (!s.dead && s.y >= GROUND_Y) {
          reachedGround.push(s.id);
          return { ...s, dead: true };
        }
        return s;
      });

      // For each streak that hit the ground, destroy the nearest alive city
      for (const sid of reachedGround) {
        const streak = updatedStreaks.find((s) => s.id === sid);
        if (!streak) continue;
        let minDist = Infinity;
        let minIdx = -1;
        updatedCities.forEach((c, i) => {
          if (!c.alive) return;
          const d = Math.abs(c.x - streak.x);
          if (d < minDist) {
            minDist = d;
            minIdx = i;
          }
        });
        if (minIdx >= 0) {
          updatedCities = updatedCities.map((c, i) =>
            i === minIdx ? { ...c, alive: false } : c,
          );
          // Create explosion at city
          const exp: Explosion = {
            id: nextId++,
            x: updatedCities[minIdx]!.x,
            y: CITY_Y,
            radius: 0,
            maxRadius: 0.05,
            growing: true,
          };
          updatedExplosions.push(exp);
        }
      }

      // ── Remove dead streaks ────────────────────────────────────────────────
      updatedStreaks = updatedStreaks.filter((s) => !s.dead);

      // ── Spawn new streaks ──────────────────────────────────────────────────
      let newState: MissileCommandState = {
        ...state,
        streaks: updatedStreaks,
        explosions: updatedExplosions,
        cities: updatedCities,
        score,
        nextId,
        spawnCooldown: Math.max(0, spawnCooldown - dt),
        streaksLeft,
        wave,
      };

      if (newState.spawnCooldown <= 0 && newState.streaksLeft > 0) {
        newState = spawnStreak(newState);
      }

      // ── Game over check (before wave transition) ───────────────────────────
      const allDead = newState.cities.every((c) => !c.alive);
      if (allDead) {
        return { ...newState, over: true };
      }

      // ── Wave transition ────────────────────────────────────────────────────
      const waveComplete =
        newState.streaksLeft === 0 &&
        newState.streaks.length === 0 &&
        newState.explosions.length === 0;
      if (waveComplete) {
        const newWave = wave + 1;
        if (newWave > 6) {
          return { ...newState, won: true };
        }
        return {
          ...newState,
          wave: newWave,
          streaksLeft: BASE_STREAKS_PER_WAVE + (newWave - 1) * STREAKS_INCREMENT,
          spawnCooldown: 1.0,
        };
      }

      return newState;
    }

    default:
      return state;
  }
}

export function isTerminal(state: MissileCommandState): { score: number } | null {
  if (state.over) return { score: state.score };
  if (state.won) return { score: state.score + 500 };
  return null;
}

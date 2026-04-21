// ─── Asteroids-like state ─────────────────────────────────────────────────────
// Normalized coordinates [0, 1]. Wrapped play area.

export interface AsteroidsSettings {
  startingAsteroids: "5" | "8" | "12";
}

export interface Ship {
  x: number;
  y: number;
  angle: number; // radians, 0 = up
  vx: number;
  vy: number;
  thrusting: boolean;
}

export interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number; // 3 = large, 2 = medium, 1 = small
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number; // ticks remaining
}

export interface AsteroidsState {
  settings: AsteroidsSettings;
  ship: Ship;
  asteroids: readonly Asteroid[];
  bullets: readonly Bullet[];
  score: number;
  lives: number;
  over: boolean;
  won: boolean;
  nextId: number;
  invincible: number; // invincibility ticks after spawn
  rotating: "left" | "right" | null;
  thrusting: boolean;
}

export type AsteroidsAction =
  | { type: "tick"; dt: number }
  | { type: "rotate"; dir: "left" | "right" | null }
  | { type: "thrust"; on: boolean }
  | { type: "fire" };

// ─── Constants ────────────────────────────────────────────────────────────────
const ROTATE_SPEED = 3.0; // rad/sec
const THRUST_POWER = 0.25; // units/sec^2
const MAX_SPEED = 0.6;
const FRICTION = 0.98;
const BULLET_SPEED = 0.7;
const BULLET_TTL = 90; // ticks
const INVINCIBLE_TICKS = 120;

const ASTEROID_SCORES: Record<number, number> = { 3: 20, 2: 50, 1: 100 };

// Simple LCG
function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function wrap(v: number): number {
  return ((v % 1) + 1) % 1;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = Math.min(Math.abs(ax - bx), 1 - Math.abs(ax - bx));
  const dy = Math.min(Math.abs(ay - by), 1 - Math.abs(ay - by));
  return Math.sqrt(dx * dx + dy * dy);
}

function asteroidRadius(size: number): number {
  return size === 3 ? 0.06 : size === 2 ? 0.035 : 0.018;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: AsteroidsSettings): AsteroidsState {
  const count = parseInt(settings.startingAsteroids, 10);
  let s = lcg(seed);
  const asteroids: Asteroid[] = [];
  let id = 1;
  for (let i = 0; i < count; i++) {
    s = lcg(s);
    const x = (s & 0xff) / 255;
    s = lcg(s);
    const y = (s & 0xff) / 255;
    s = lcg(s);
    const angle = ((s & 0xff) / 255) * Math.PI * 2;
    s = lcg(s);
    const speed = 0.04 + ((s & 0xff) / 255) * 0.06;
    asteroids.push({
      id: id++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3,
    });
  }
  return {
    settings,
    ship: { x: 0.5, y: 0.5, angle: -Math.PI / 2, vx: 0, vy: 0, thrusting: false },
    asteroids,
    bullets: [],
    score: 0,
    lives: 3,
    over: false,
    won: false,
    nextId: id,
    invincible: INVINCIBLE_TICKS,
    rotating: null,
    thrusting: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: AsteroidsState, action: AsteroidsAction): AsteroidsState {
  if (state.over || state.won) return state;

  switch (action.type) {
    case "rotate":
      return { ...state, rotating: action.dir };

    case "thrust":
      return { ...state, thrusting: action.on };

    case "fire": {
      const { ship } = state;
      const bullet: Bullet = {
        id: state.nextId,
        x: ship.x + Math.cos(ship.angle) * 0.03,
        y: ship.y + Math.sin(ship.angle) * 0.03,
        vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx,
        vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy,
        ttl: BULLET_TTL,
      };
      return {
        ...state,
        nextId: state.nextId + 1,
        bullets: [...state.bullets, bullet],
      };
    }

    case "tick": {
      const { dt } = action;
      let { ship, asteroids, bullets, score, lives, invincible, nextId } = state;
      const { rotating, thrusting } = state;

      // ── Ship rotation ──────────────────────────────────────────────────────
      let angle = ship.angle;
      if (rotating === "left") angle -= ROTATE_SPEED * dt;
      if (rotating === "right") angle += ROTATE_SPEED * dt;

      // ── Ship thrust ────────────────────────────────────────────────────────
      let vx = ship.vx;
      let vy = ship.vy;
      if (thrusting) {
        vx += Math.cos(angle) * THRUST_POWER * dt;
        vy += Math.sin(angle) * THRUST_POWER * dt;
      }
      // Friction
      vx *= Math.pow(FRICTION, dt * 60);
      vy *= Math.pow(FRICTION, dt * 60);
      // Speed cap
      const spd = Math.sqrt(vx * vx + vy * vy);
      if (spd > MAX_SPEED) { vx = (vx / spd) * MAX_SPEED; vy = (vy / spd) * MAX_SPEED; }

      const shipX = wrap(ship.x + vx * dt);
      const shipY = wrap(ship.y + vy * dt);

      ship = { x: shipX, y: shipY, angle, vx, vy, thrusting };

      // ── Move bullets ───────────────────────────────────────────────────────
      let newBullets: Bullet[] = bullets
        .map((b) => ({
          ...b,
          x: wrap(b.x + b.vx * dt),
          y: wrap(b.y + b.vy * dt),
          ttl: b.ttl - 1,
        }))
        .filter((b) => b.ttl > 0);

      // ── Move asteroids ─────────────────────────────────────────────────────
      let newAsteroids: Asteroid[] = asteroids.map((a) => ({
        ...a,
        x: wrap(a.x + a.vx * dt),
        y: wrap(a.y + a.vy * dt),
      }));

      // ── Bullet-asteroid collision ──────────────────────────────────────────
      const bulletHit = new Set<number>();
      const asteroidHit = new Set<number>();
      const newChildren: Asteroid[] = [];

      for (const bullet of newBullets) {
        for (const ast of newAsteroids) {
          if (asteroidHit.has(ast.id)) continue;
          const r = asteroidRadius(ast.size);
          if (dist(bullet.x, bullet.y, ast.x, ast.y) < r + 0.01) {
            bulletHit.add(bullet.id);
            asteroidHit.add(ast.id);
            score += ASTEROID_SCORES[ast.size] ?? 20;
            // Split
            if (ast.size > 1) {
              const childSize = ast.size - 1;
              const spd2 = Math.sqrt(ast.vx * ast.vx + ast.vy * ast.vy) * 1.3 + 0.05;
              newChildren.push(
                { id: nextId++, x: ast.x, y: ast.y, vx: -ast.vy * 1.3, vy: ast.vx * 1.3, size: childSize },
                { id: nextId++, x: ast.x, y: ast.y, vx: ast.vy * spd2, vy: -ast.vx * spd2, size: childSize },
              );
            }
          }
        }
      }

      newBullets = newBullets.filter((b) => !bulletHit.has(b.id));
      newAsteroids = [
        ...newAsteroids.filter((a) => !asteroidHit.has(a.id)),
        ...newChildren,
      ];

      // ── Ship-asteroid collision ────────────────────────────────────────────
      let newLives = lives;
      let newInvincible = Math.max(0, invincible - 1);
      let dead = false;

      if (invincible <= 0) {
        for (const ast of newAsteroids) {
          const r = asteroidRadius(ast.size);
          if (dist(shipX, shipY, ast.x, ast.y) < r + 0.02) {
            dead = true;
            break;
          }
        }
        if (dead) {
          newLives -= 1;
          newInvincible = INVINCIBLE_TICKS;
          ship = { x: 0.5, y: 0.5, angle: -Math.PI / 2, vx: 0, vy: 0, thrusting: false };
        }
      }

      const over = newLives <= 0;
      const won = !over && newAsteroids.length === 0;

      return {
        ...state,
        ship,
        asteroids: newAsteroids,
        bullets: newBullets,
        score,
        lives: newLives,
        over,
        won,
        nextId,
        invincible: newInvincible,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AsteroidsState): { score: number } | null {
  if (state.over) return { score: state.score };
  if (state.won) return { score: state.score + state.lives * 200 };
  return null;
}

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
// World is wider than screen — scrolling shooter
export const WORLD_W = 3.0; // normalized world width (screen = 1.0)
export const SHIP_W = 0.05;
export const SHIP_H = 0.03;
export const BULLET_SPEED = 1.4;
export const BULLET_H = 0.012;
export const BULLET_W = 0.04;
export const HUMAN_W = 0.025;
export const HUMAN_H = 0.03;
export const ALIEN_W = 0.04;
export const ALIEN_H = 0.03;
export const GROUND_Y = 0.92;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Human {
  id: number;
  x: number; // world coords
  y: number;
  alive: boolean;
  carried: boolean; // being abducted
  carriedBy: number | null;
}

export interface Alien {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  abducting: Human | null;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
}

export interface SkyDefenderState {
  shipX: number; // world x
  shipY: number; // screen y (0..1)
  shipFacing: 1 | -1;
  cameraX: number; // left edge of viewport in world coords
  humans: readonly Human[];
  aliens: readonly Alien[];
  bullets: readonly Bullet[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  paused: boolean;
  rngSeed: number;
  nextId: number;
  spawnTimer: number;
  wave: number;
}

export type SkyDefenderAction =
  | { type: "tick"; dt: number }
  | { type: "move"; dx: number; dy: number }
  | { type: "fire" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildHumans(seed: number): Human[] {
  const rng = mulberry32(seed);
  const humans: Human[] = [];
  for (let i = 0; i < 10; i++) {
    humans.push({
      id: i,
      x: 0.1 + rng() * (WORLD_W - 0.2),
      y: GROUND_Y - HUMAN_H,
      alive: true,
      carried: false,
      carriedBy: null,
    });
  }
  return humans;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): SkyDefenderState {
  const rng = mulberry32(seed);
  const aliens: Alien[] = Array.from({ length: 8 }, (_, i) => ({
    id: 100 + i,
    x: 0.3 + rng() * (WORLD_W - 0.6),
    y: 0.1 + rng() * 0.4,
    vx: (rng() > 0.5 ? 1 : -1) * (0.2 + rng() * 0.15),
    vy: 0,
    alive: true,
    abducting: null,
  }));

  return {
    shipX: 0.5,
    shipY: 0.5,
    shipFacing: 1,
    cameraX: 0,
    humans: buildHumans(seed),
    aliens,
    bullets: [],
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    paused: false,
    rngSeed: seed,
    nextId: 200,
    spawnTimer: 20,
    wave: 1,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: SkyDefenderState, action: SkyDefenderAction): SkyDefenderState {
  switch (action.type) {
    case "pause": return { ...state, paused: true };
    case "resume": return { ...state, paused: false };

    case "move": {
      if (state.lost || state.won) return state;
      const { dx, dy } = action;
      let shipX = Math.max(0, Math.min(WORLD_W - SHIP_W, state.shipX + dx));
      const shipY = Math.max(0.05, Math.min(GROUND_Y - SHIP_H, state.shipY + dy));
      const shipFacing: 1 | -1 = dx > 0 ? 1 : dx < 0 ? -1 : state.shipFacing;
      // Camera follows ship
      const cameraX = Math.max(0, Math.min(WORLD_W - 1, shipX - 0.4));
      return { ...state, shipX, shipY, shipFacing, cameraX };
    }

    case "fire": {
      if (state.lost || state.won) return state;
      const playerBullets = state.bullets.filter((b) => b.vx !== 0);
      if (playerBullets.length >= 4) return state;
      const bullet: Bullet = {
        id: state.nextId,
        x: state.shipX + (state.shipFacing > 0 ? SHIP_W : 0),
        y: state.shipY + SHIP_H / 2,
        vx: BULLET_SPEED * state.shipFacing,
      };
      return {
        ...state,
        bullets: [...state.bullets, bullet],
        nextId: state.nextId + 1,
      };
    }

    case "tick": {
      if (state.paused || state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed);

      // Move bullets
      let bullets = state.bullets
        .map((b) => ({ ...b, x: b.x + b.vx * dt }))
        .filter((b) => b.x > -0.1 && b.x < WORLD_W + 0.1) as Bullet[];

      // Move aliens
      let humans = state.humans as Human[];
      let aliens = state.aliens.map((a) => {
        if (!a.alive) return a;
        let { x, y, vx, vy } = a;
        x += vx * dt;
        y += vy * dt;

        // Wrap world
        if (x < 0) x = WORLD_W;
        if (x > WORLD_W) x = 0;

        // Abduction behavior
        if (!a.abducting) {
          // Dive toward a human randomly
          if (rng() < 0.005) {
            const targets = humans.filter((h) => h.alive && !h.carried);
            if (targets.length > 0) {
              const target = targets[Math.floor(rng() * targets.length)]!;
              vy = 0.25; // dive down
              vx = Math.sign(target.x - x) * 0.15;
            }
          }
        } else {
          // Carrying human — fly up
          vy = -0.25;
          const carried = a.abducting;
          humans = humans.map((h) =>
            h.id === carried.id ? { ...h, y: y + ALIEN_H, carried: true } : h,
          );
        }

        // Land on human
        if (!a.abducting && y + ALIEN_H >= GROUND_Y - HUMAN_H) {
          const touchedHuman = humans.find(
            (h) => h.alive && !h.carried && Math.abs(h.x - x) < ALIEN_W,
          );
          if (touchedHuman) {
            humans = humans.map((h) =>
              h.id === touchedHuman.id ? { ...h, carried: true, carriedBy: a.id } : h,
            );
            return { ...a, x, y, vx, vy, abducting: touchedHuman };
          }
        }

        // Alien reaches top while carrying → human lost
        if (a.abducting && y < 0) {
          const carriedId = a.abducting.id;
          humans = humans.map((h) => (h.id === carriedId ? { ...h, alive: false, carried: false } : h));
          return { ...a, x, y: 0.05, vx, vy: 0, abducting: null };
        }

        // Bounce off ceiling
        if (y < 0.05) { y = 0.05; vy = Math.abs(vy); }
        if (y > GROUND_Y - ALIEN_H) { y = GROUND_Y - ALIEN_H; vy = -Math.abs(vy); }

        return { ...a, x, y, vx, vy };
      }) as Alien[];

      // Bullet-alien collision
      const hitAlienIds = new Set<number>();
      const hitBulletIds = new Set<number>();
      for (const b of bullets) {
        for (const a of aliens) {
          if (!a.alive || hitAlienIds.has(a.id)) continue;
          if (
            b.x >= a.x - ALIEN_W / 2 && b.x <= a.x + ALIEN_W / 2 &&
            b.y >= a.y - ALIEN_H / 2 && b.y <= a.y + ALIEN_H / 2
          ) {
            hitAlienIds.add(a.id);
            hitBulletIds.add(b.id);
          }
        }
      }

      let score = state.score + hitAlienIds.size * 150;

      // Free humans from killed aliens
      aliens = aliens.map((a) => {
        if (!hitAlienIds.has(a.id)) return a;
        if (a.abducting) {
          humans = humans.map((h) =>
            h.id === a.abducting!.id
              ? { ...h, carried: false, carriedBy: null, y: GROUND_Y - HUMAN_H }
              : h,
          );
        }
        return { ...a, alive: false };
      });

      bullets = bullets.filter((b) => !hitBulletIds.has(b.id));

      // Ship-alien collision
      let { lives } = state;
      let lost: boolean = state.lost;
      for (const a of aliens) {
        if (!a.alive) continue;
        const sx = state.shipX;
        const sy = state.shipY;
        if (
          Math.abs(sx - a.x) < (SHIP_W + ALIEN_W) / 2 &&
          Math.abs(sy - a.y) < (SHIP_H + ALIEN_H) / 2
        ) {
          lives -= 1;
          if (lives <= 0) lost = true;
          break;
        }
      }

      // All aliens dead?
      let { wave, spawnTimer } = state;
      spawnTimer -= dt;
      const aliveAliens = aliens.filter((a) => a.alive);
      let won: boolean = false;
      let nextId = state.nextId;

      if (aliveAliens.length === 0 && wave >= 3) {
        won = true;
      } else if (aliveAliens.length === 0) {
        wave++;
        const newAliens: Alien[] = Array.from({ length: 8 + wave * 2 }, (_, i) => ({
          id: nextId + i,
          x: 0.3 + rng() * (WORLD_W - 0.6),
          y: 0.1 + rng() * 0.4,
          vx: (rng() > 0.5 ? 1 : -1) * (0.2 + rng() * 0.2),
          vy: 0,
          alive: true,
          abducting: null,
        }));
        nextId += newAliens.length;
        aliens = [...aliens, ...newAliens];
      }

      // All humans dead → lose
      const aliveHumans = humans.filter((h) => h.alive);
      if (aliveHumans.length === 0) lost = true;

      return {
        ...state,
        bullets,
        aliens,
        humans,
        score,
        lives,
        lost: lost as boolean,
        won: won as boolean,
        wave,
        spawnTimer,
        nextId,
        rngSeed: state.rngSeed + 1,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: SkyDefenderState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 1000 };
  if (state.lost) return { score: state.score };
  return null;
}

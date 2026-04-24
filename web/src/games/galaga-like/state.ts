import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
export const PLAYER_Y = 0.88;
export const PLAYER_WIDTH = 0.06;
export const PLAYER_HEIGHT = 0.05;
export const BULLET_RADIUS = 0.008;
export const ENEMY_ROWS = 4;
export const ENEMY_COLS = 8;
export const ENEMY_W = 0.07;
export const ENEMY_H = 0.055;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Enemy {
  id: number;
  col: number;
  row: number;
  alive: boolean;
  x: number;
  y: number;
  diving: boolean;
  diveVx: number;
  diveVy: number;
  diveTarget: number; // target x when diving
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vy: number; // negative = up (player), positive = down (enemy)
  isEnemy: boolean;
}

export interface GalaxyFormationState {
  playerX: number;
  bullets: readonly Bullet[];
  enemies: readonly Enemy[];
  score: number;
  lives: number;
  wave: number;
  lost: boolean;
  won: boolean;
  paused: boolean;
  rngSeed: number;
  nextBulletId: number;
  nextEnemyId: number;
  enemyDx: number; // formation drift speed
  enemyDriftX: number; // how far formation has drifted from center
  enemyFireCooldown: number;
  playerInvincible: number; // frames of invincibility after hit
}

export type GalaxyFormationAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number }
  | { type: "fire" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildEnemies(wave: number, seed: number): Enemy[] {
  const enemies: Enemy[] = [];
  const rng = mulberry32(seed);
  let id = 0;
  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      const x = 0.1 + col * (0.8 / (ENEMY_COLS - 1));
      const y = 0.06 + row * 0.09;
      enemies.push({
        id: id++,
        col,
        row,
        alive: true,
        x,
        y,
        diving: false,
        diveVx: 0,
        diveVy: 0,
        diveTarget: rng() * 0.8 + 0.1,
      });
    }
  }
  void wave;
  return enemies;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): GalaxyFormationState {
  return {
    playerX: 0.5,
    bullets: [],
    enemies: buildEnemies(1, seed),
    score: 0,
    lives: 3,
    wave: 1,
    lost: false,
    won: false,
    paused: false,
    rngSeed: seed,
    nextBulletId: 0,
    nextEnemyId: ENEMY_ROWS * ENEMY_COLS,
    enemyDx: 0.04,
    enemyDriftX: 0,
    enemyFireCooldown: 2,
    playerInvincible: 0,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(
  state: GalaxyFormationState,
  action: GalaxyFormationAction,
): GalaxyFormationState {
  switch (action.type) {
    case "pause":
      return { ...state, paused: true };
    case "resume":
      return { ...state, paused: false };

    case "move": {
      const x = Math.max(PLAYER_WIDTH / 2, Math.min(1 - PLAYER_WIDTH / 2, action.x));
      return { ...state, playerX: x };
    }

    case "fire": {
      if (state.lost || state.won) return state;
      const playerBullets = state.bullets.filter((b) => !b.isEnemy);
      if (playerBullets.length >= 2) return state; // cap at 2 simultaneous bullets
      const newBullet: Bullet = {
        id: state.nextBulletId,
        x: state.playerX,
        y: PLAYER_Y - PLAYER_HEIGHT / 2,
        vy: -0.9,
        isEnemy: false,
      };
      return {
        ...state,
        bullets: [...state.bullets, newBullet],
        nextBulletId: state.nextBulletId + 1,
      };
    }

    case "tick": {
      if (state.paused || state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed + Math.floor(Date.now() / 100));

      // Move bullets
      let bullets = state.bullets
        .map((b) => ({ ...b, y: b.y + b.vy * dt }))
        .filter((b) => b.y > -0.05 && b.y < 1.05) as Bullet[];

      // Move enemies (formation drift)
      const speedMult = 1 + (state.wave - 1) * 0.2;
      let dx = state.enemyDx * speedMult;
      let driftX = state.enemyDriftX + dx * dt;
      if (Math.abs(driftX) > 0.12) {
        dx = -dx;
        driftX = state.enemyDriftX;
      }

      // Update diving enemies
      let enemies = state.enemies.map((e) => {
        if (!e.alive) return e;
        if (e.diving) {
          const newX = e.x + e.diveVx * dt;
          const newY = e.y + e.diveVy * dt;
          return { ...e, x: newX, y: newY };
        }
        // Formation position
        const baseX = 0.1 + e.col * (0.8 / (ENEMY_COLS - 1)) + driftX;
        const baseY = 0.06 + e.row * 0.09;
        return { ...e, x: baseX, y: baseY };
      }) as Enemy[];

      // Launch random enemy dive
      const aliveFormation = enemies.filter((e) => e.alive && !e.diving);
      if (aliveFormation.length > 0 && rng() < 0.015 * speedMult) {
        const idx = Math.floor(rng() * aliveFormation.length);
        const target = aliveFormation[idx]!;
        enemies = enemies.map((e) =>
          e.id === target.id
            ? {
                ...e,
                diving: true,
                diveVx: (e.diveTarget - e.x) * 0.5,
                diveVy: 0.4 + rng() * 0.3,
              }
            : e,
        );
      }

      // Remove enemies that flew off screen — return them to formation
      enemies = enemies.map((e) => {
        if (e.alive && e.diving && e.y > 1.1) {
          const baseX = 0.1 + e.col * (0.8 / (ENEMY_COLS - 1));
          const baseY = -0.1;
          return { ...e, diving: false, x: baseX, y: baseY };
        }
        return e;
      });

      // Bullet-enemy collisions
      const hitEnemyIds = new Set<number>();
      const hitBulletIds = new Set<number>();
      for (const b of bullets) {
        if (b.isEnemy) continue;
        for (const e of enemies) {
          if (!e.alive || hitEnemyIds.has(e.id)) continue;
          if (
            Math.abs(b.x - e.x) < ENEMY_W / 2 + BULLET_RADIUS &&
            Math.abs(b.y - e.y) < ENEMY_H / 2 + BULLET_RADIUS
          ) {
            hitEnemyIds.add(e.id);
            hitBulletIds.add(b.id);
          }
        }
      }

      const scoreGain = hitEnemyIds.size * 100;
      enemies = enemies.map((e) =>
        hitEnemyIds.has(e.id) ? { ...e, alive: false } : e,
      );
      bullets = bullets.filter((b) => !hitBulletIds.has(b.id));

      // Enemy fires back
      let { enemyFireCooldown } = state;
      enemyFireCooldown -= dt;
      if (enemyFireCooldown <= 0) {
        const aliveEnemies = enemies.filter((e) => e.alive);
        if (aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(rng() * aliveEnemies.length)]!;
          bullets = [
            ...bullets,
            {
              id: state.nextBulletId + 100,
              x: shooter.x,
              y: shooter.y + ENEMY_H / 2,
              vy: 0.5 + speedMult * 0.1,
              isEnemy: true,
            },
          ];
        }
        enemyFireCooldown = 1.5 / speedMult;
      }

      // Player hit check
      let { lives, playerInvincible } = state;
      playerInvincible = Math.max(0, playerInvincible - dt);
      let lost: boolean = state.lost;

      if (playerInvincible <= 0) {
        for (const b of bullets) {
          if (!b.isEnemy) continue;
          if (
            Math.abs(b.x - state.playerX) < PLAYER_WIDTH / 2 &&
            Math.abs(b.y - PLAYER_Y) < PLAYER_HEIGHT / 2
          ) {
            lives -= 1;
            playerInvincible = 2;
            bullets = bullets.filter((bb) => bb !== b);
            if (lives <= 0) {
              lost = true;
            }
            break;
          }
        }
        // Enemy collision with player
        for (const e of enemies) {
          if (!e.alive) continue;
          if (
            Math.abs(e.x - state.playerX) < (PLAYER_WIDTH + ENEMY_W) / 2 &&
            Math.abs(e.y - PLAYER_Y) < (PLAYER_HEIGHT + ENEMY_H) / 2
          ) {
            lives -= 1;
            playerInvincible = 2;
            if (lives <= 0) lost = true;
            break;
          }
        }
      }

      const allDead = enemies.every((e) => !e.alive);
      let won: boolean = false;
      let wave = state.wave;
      let newEnemies = enemies;
      let newDriftX = driftX;

      if (allDead && wave >= 3) {
        won = true;
      } else if (allDead) {
        wave += 1;
        newEnemies = buildEnemies(wave, state.rngSeed + wave);
        newDriftX = 0;
      }

      return {
        ...state,
        bullets,
        enemies: newEnemies,
        score: state.score + scoreGain,
        lives,
        wave,
        lost: lost as boolean,
        won: won as boolean,
        enemyDx: dx,
        enemyDriftX: newDriftX,
        enemyFireCooldown,
        playerInvincible,
        rngSeed: state.rngSeed + 1,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: GalaxyFormationState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 500 };
  if (state.lost) return { score: state.score };
  return null;
}

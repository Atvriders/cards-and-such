import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Constants ────────────────────────────────────────────────────────────────
export const GRAVITY = 0.6;
export const FLAP_VY = -0.35;
export const PLAYER_R = 0.03;
export const ENEMY_R = 0.028;
export const PLATFORM_H = 0.02;

export interface Platform {
  x: number; // center
  y: number;
  w: number;
}

export const PLATFORMS: readonly Platform[] = [
  { x: 0.5, y: 0.92, w: 1.0 },   // floor
  { x: 0.2, y: 0.65, w: 0.25 },
  { x: 0.8, y: 0.65, w: 0.25 },
  { x: 0.5, y: 0.45, w: 0.3 },
  { x: 0.15, y: 0.25, w: 0.2 },
  { x: 0.85, y: 0.25, w: 0.2 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SkyEnemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  egg: boolean; // defeated enemy becomes egg on ground
  eggTimer: number;
}

export interface SkyJoustState {
  playerX: number;
  playerY: number;
  playerVx: number;
  playerVy: number;
  enemies: readonly SkyEnemy[];
  score: number;
  lives: number;
  lost: boolean;
  won: boolean;
  paused: boolean;
  rngSeed: number;
  wave: number;
}

export type SkyJoustAction =
  | { type: "tick"; dt: number }
  | { type: "flap" }
  | { type: "move-left" }
  | { type: "move-right" }
  | { type: "pause" }
  | { type: "resume" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildEnemies(wave: number, seed: number): SkyEnemy[] {
  const rng = mulberry32(seed);
  const count = 3 + wave;
  const enemies: SkyEnemy[] = [];
  for (let i = 0; i < count; i++) {
    enemies.push({
      id: i,
      x: 0.2 + rng() * 0.6,
      y: 0.3 + rng() * 0.4,
      vx: (rng() > 0.5 ? 1 : -1) * (0.15 + rng() * 0.1),
      vy: 0,
      alive: true,
      egg: false,
      eggTimer: 0,
    });
  }
  return enemies;
}

function onPlatform(x: number, y: number, r: number): boolean {
  for (const p of PLATFORMS) {
    const left = p.x - p.w / 2;
    const right = p.x + p.w / 2;
    if (x >= left && x <= right && Math.abs(y + r - p.y) < 0.015) return true;
  }
  return false;
}

function platformLandY(x: number, r: number): number | null {
  for (const p of PLATFORMS) {
    const left = p.x - p.w / 2;
    const right = p.x + p.w / 2;
    if (x >= left && x <= right) return p.y - r;
  }
  return null;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function initialState(seed: number): SkyJoustState {
  return {
    playerX: 0.5,
    playerY: PLATFORMS[0]!.y - PLAYER_R,
    playerVx: 0,
    playerVy: 0,
    enemies: buildEnemies(1, seed),
    score: 0,
    lives: 3,
    lost: false,
    won: false,
    paused: false,
    rngSeed: seed,
    wave: 1,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: SkyJoustState, action: SkyJoustAction): SkyJoustState {
  switch (action.type) {
    case "pause": return { ...state, paused: true };
    case "resume": return { ...state, paused: false };
    case "flap":
      if (state.lost || state.won) return state;
      return { ...state, playerVy: FLAP_VY };
    case "move-left":
      if (state.lost || state.won) return state;
      return { ...state, playerVx: -0.35 };
    case "move-right":
      if (state.lost || state.won) return state;
      return { ...state, playerVx: 0.35 };

    case "tick": {
      if (state.paused || state.lost || state.won) return state;
      const { dt } = action;
      const rng = mulberry32(state.rngSeed);

      // Move player
      let { playerX, playerY, playerVx, playerVy, score, lives } = state;
      let lost: boolean = state.lost;
      let won: boolean = state.won;
      playerVy += GRAVITY * dt;
      playerX += playerVx * dt;
      playerY += playerVy * dt;
      playerVx *= Math.pow(0.85, dt * 60); // friction

      // Wrap horizontally
      if (playerX < 0) playerX = 1;
      if (playerX > 1) playerX = 0;

      // Platform landing for player
      for (const p of PLATFORMS) {
        const left = p.x - p.w / 2;
        const right = p.x + p.w / 2;
        if (playerX >= left && playerX <= right && playerVy >= 0) {
          const landY = p.y - PLAYER_R;
          if (playerY >= landY && playerY < landY + 0.06) {
            playerY = landY;
            playerVy = 0;
          }
        }
      }

      // Ceiling bounce
      if (playerY < PLAYER_R) {
        playerY = PLAYER_R;
        playerVy = Math.abs(playerVy);
      }

      // Move enemies
      let enemies = state.enemies as SkyEnemy[];
      enemies = enemies.map((e) => {
        if (!e.alive) return e;
        if (e.egg) {
          return { ...e, eggTimer: e.eggTimer - dt };
        }

        let { x, y, vx, vy } = e;
        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        // Random flap
        if (rng() < 0.04) vy = FLAP_VY * (0.7 + rng() * 0.3);

        // Wrap
        if (x < 0) x = 1;
        if (x > 1) x = 0;

        // Platform landing
        for (const p of PLATFORMS) {
          const left = p.x - p.w / 2;
          const right = p.x + p.w / 2;
          if (x >= left && x <= right && vy >= 0) {
            const landY = p.y - ENEMY_R;
            if (y >= landY && y < landY + 0.06) {
              y = landY;
              vy = 0;
              vx = -vx; // reverse on landing
            }
          }
        }
        if (y < ENEMY_R) { y = ENEMY_R; vy = Math.abs(vy); }

        return { ...e, x, y, vx, vy };
      });

      // Hatch eggs back to enemies
      enemies = enemies.map((e) => {
        if (e.egg && e.eggTimer <= 0) {
          return { ...e, egg: false, eggTimer: 0, vy: FLAP_VY, vx: (rng() > 0.5 ? 1 : -1) * 0.18 };
        }
        return e;
      });

      // Combat: player vs enemy
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i]!;
        if (!e.alive || e.egg) continue;
        const dx = Math.abs(playerX - e.x);
        const dy = Math.abs(playerY - e.y);
        const dist = PLAYER_R + ENEMY_R;
        if (dx < dist && dy < dist) {
          // Player wins if higher (lower y) than enemy
          if (playerY < e.y - 0.01) {
            // Kill enemy → egg
            enemies = enemies.map((ee, j) =>
              j === i
                ? {
                    ...ee,
                    egg: true,
                    eggTimer: 5,
                    vx: 0,
                    vy: 0,
                    y: platformLandY(e.x, ENEMY_R) ?? e.y,
                  }
                : ee,
            );
            score += 250;
          } else {
            // Enemy wins
            lives -= 1;
            if (lives <= 0) lost = true;
            playerX = 0.5;
            playerY = PLATFORMS[0]!.y - PLAYER_R;
            playerVx = 0;
            playerVy = 0;
            break;
          }
        }
      }

      // Collect eggs (player lands on egg)
      enemies = enemies.map((e) => {
        if (!e.alive || !e.egg) return e;
        const dx = Math.abs(playerX - e.x);
        const dy = Math.abs(playerY - e.y);
        if (dx < PLAYER_R + ENEMY_R && dy < PLAYER_R + ENEMY_R) {
          score += 500;
          return { ...e, alive: false };
        }
        return e;
      });

      const aliveEnemies = enemies.filter((e) => e.alive);
      let wave = state.wave;
      if (aliveEnemies.length === 0 && wave < 3) {
        wave++;
        enemies = buildEnemies(wave, state.rngSeed + wave);
      } else if (aliveEnemies.length === 0) {
        won = true;
      }

      return {
        ...state,
        playerX, playerY, playerVx, playerVy,
        enemies, score, lives, lost: lost as boolean, won: won as boolean, wave,
        rngSeed: state.rngSeed + 1,
      };
    }

    default:
      return state;
  }
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function isTerminal(state: SkyJoustState): { score: number } | null {
  if (state.won) return { score: state.score + state.lives * 500 };
  if (state.lost) return { score: state.score };
  return null;
}

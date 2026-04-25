import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SwarmShootSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vy: number;
}

export interface SwarmShootState {
  settings: SwarmShootSettings;
  playerX: number;
  bullets: readonly Bullet[];
  enemies: readonly Enemy[];
  score: number;
  lives: number;
  wave: number;
  over: boolean;
  elapsed: number;
  shootCooldown: number;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type SwarmShootAction =
  | { type: "tick"; dt: number }
  | { type: "move"; x: number }
  | { type: "shoot" };

const BULLET_SPEED = 1.2;
const SHOOT_COOLDOWN = 0.25;
const ENEMY_RADIUS = 0.04;

function diffScale(d: SwarmShootSettings["difficulty"]): number {
  return d === "easy" ? 0.7 : d === "hard" ? 1.4 : 1.0;
}

function rngAt(seed: number, counter: number): number {
  return mulberry32(seed + counter * 1000003)();
}

function spawnWave(seed: number, counter: number, wave: number, scale: number): { enemies: Enemy[]; counter: number; nextId: number } {
  const count = 5 + wave * 2;
  const enemies: Enemy[] = [];
  let id = counter * 100;
  for (let i = 0; i < count; i++) {
    const x = 0.05 + rngAt(seed, counter++) * 0.9;
    const y = -0.05 - rngAt(seed, counter++) * 0.3;
    const vx = (rngAt(seed, counter++) - 0.5) * 0.15 * scale;
    const vy = (0.06 + rngAt(seed, counter++) * 0.08) * scale;
    enemies.push({ id: id++, x, y, vx, vy, radius: ENEMY_RADIUS, hp: 1 + (wave > 3 ? 1 : 0) });
  }
  return { enemies, counter, nextId: id };
}

export function initialState(seed: number, settings: SwarmShootSettings): SwarmShootState {
  const scale = diffScale(settings.difficulty);
  const { enemies, counter, nextId } = spawnWave(seed, 0, 1, scale);
  return {
    settings,
    playerX: 0.5,
    bullets: [],
    enemies,
    score: 0,
    lives: 3,
    wave: 1,
    over: false,
    elapsed: 0,
    shootCooldown: 0,
    rngSeed: seed,
    rngCounter: counter,
    nextId,
  };
}

export function reducer(state: SwarmShootState, action: SwarmShootAction): SwarmShootState {
  if (state.over) return state;

  switch (action.type) {
    case "move": {
      const x = Math.max(0.02, Math.min(0.98, action.x));
      return { ...state, playerX: x };
    }

    case "shoot": {
      if (state.shootCooldown > 0) return state;
      const bullet: Bullet = { id: state.nextId, x: state.playerX, y: 0.88, vy: -BULLET_SPEED };
      return { ...state, bullets: [...state.bullets, bullet], shootCooldown: SHOOT_COOLDOWN, nextId: state.nextId + 1 };
    }

    case "tick": {
      const { dt } = action;
      const scale = diffScale(state.settings.difficulty);
      const newElapsed = state.elapsed + dt;
      let { score, lives, wave } = state;
      let counter = state.rngCounter;
      let nextId = state.nextId;

      // Move bullets
      let bullets: Bullet[] = state.bullets.map((b) => ({ ...b, y: b.y + b.vy * dt }));
      bullets = bullets.filter((b) => b.y > -0.05);

      // Move enemies
      let enemies: Enemy[] = state.enemies.map((e) => ({
        ...e,
        x: Math.max(0.02, Math.min(0.98, e.x + e.vx * dt)),
        y: e.y + e.vy * dt,
        vx: e.x <= 0.02 || e.x >= 0.98 ? -e.vx : e.vx,
      }));

      // Bullet-enemy collisions
      const hitEnemies = new Set<number>();
      const hitBullets = new Set<number>();
      for (const b of bullets) {
        for (const e of enemies) {
          if (hitEnemies.has(e.id)) continue;
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < e.radius + 0.015) {
            hitBullets.add(b.id);
            const newHp = e.hp - 1;
            if (newHp <= 0) {
              hitEnemies.add(e.id);
              score += 10;
            } else {
              // Reduce hp in-place
              enemies = enemies.map((en) => en.id === e.id ? { ...en, hp: newHp } : en);
            }
          }
        }
      }
      bullets = bullets.filter((b) => !hitBullets.has(b.id));
      enemies = enemies.filter((e) => !hitEnemies.has(e.id));

      // Enemies that reach the bottom = lose life
      const bottomEnemies = enemies.filter((e) => e.y >= 1.0);
      lives -= bottomEnemies.length;
      enemies = enemies.filter((e) => e.y < 1.0);

      // Next wave if all enemies cleared
      if (enemies.length === 0) {
        wave += 1;
        const result = spawnWave(state.rngSeed, counter, wave, scale);
        enemies = result.enemies;
        counter = result.counter;
        nextId = Math.max(nextId, result.nextId);
        score += 50; // wave bonus
      }

      const over = lives <= 0;
      const cooldown = Math.max(0, state.shootCooldown - dt);

      return {
        ...state,
        bullets,
        enemies,
        score,
        lives,
        wave,
        over,
        elapsed: newElapsed,
        shootCooldown: cooldown,
        rngCounter: counter,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SwarmShootState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

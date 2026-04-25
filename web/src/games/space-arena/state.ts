import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SpaceArenaSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface SpaceShip {
  id: number;
  x: number; // 0..8 column
  hp: number;
  maxHp: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number; // 0 = player row, ascending = toward enemies
  fromPlayer: boolean;
}

export interface SpaceArenaState {
  settings: SpaceArenaSettings;
  rngSeed: number;
  tick: number;
  playerX: number; // 0..8
  playerHp: number;
  enemies: SpaceShip[];
  bullets: Bullet[];
  nextId: number;
  score: number;
  wave: number;
  gameOver: boolean;
  shieldActive: boolean;
  shieldCooldown: number;
}

export type SpaceArenaAction =
  | { type: "tick" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "shoot" }
  | { type: "shield" }
  | { type: "restart" };

const COLS = 9;
const ROWS = 7;

function difficultyParams(d: SpaceArenaSettings["difficulty"]) {
  if (d === "easy") return { enemyHp: 1, spawnRate: 5, bulletSpeed: 1, enemyFireRate: 6 };
  if (d === "hard") return { enemyHp: 3, spawnRate: 3, bulletSpeed: 2, enemyFireRate: 3 };
  return { enemyHp: 2, spawnRate: 4, bulletSpeed: 1, enemyFireRate: 5 };
}

export function initialState(seed: number, settings: SpaceArenaSettings): SpaceArenaState {
  return {
    settings,
    rngSeed: seed,
    tick: 0,
    playerX: 4,
    playerHp: 5,
    enemies: [],
    bullets: [],
    nextId: 0,
    score: 0,
    wave: 1,
    gameOver: false,
    shieldActive: false,
    shieldCooldown: 0,
  };
}

export function reducer(state: SpaceArenaState, action: SpaceArenaAction): SpaceArenaState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "moveLeft") {
    return { ...state, playerX: Math.max(0, state.playerX - 1) };
  }
  if (action.type === "moveRight") {
    return { ...state, playerX: Math.min(COLS - 1, state.playerX + 1) };
  }
  if (action.type === "shoot") {
    const id = state.nextId;
    const bullet: Bullet = { id, x: state.playerX, y: ROWS - 1, fromPlayer: true };
    return { ...state, bullets: [...state.bullets, bullet], nextId: id + 1 };
  }
  if (action.type === "shield") {
    if (state.shieldCooldown > 0) return state;
    return { ...state, shieldActive: true, shieldCooldown: 10 };
  }

  if (action.type === "tick") {
    const tick = state.tick + 1;
    const rng = mulberry32(state.rngSeed + tick);
    const params = difficultyParams(state.settings.difficulty);

    // Move bullets
    let bullets = state.bullets.map(b => ({
      ...b,
      y: b.fromPlayer ? b.y - 1 : b.y + 1,
    })).filter(b => b.y >= 0 && b.y < ROWS);

    // Enemies fire
    const enemies = state.enemies;
    const newEnemyBullets: Bullet[] = [];
    let nextId = state.nextId;
    if (tick % params.enemyFireRate === 0 && enemies.length > 0) {
      const shooter = enemies[Math.floor(rng() * enemies.length)]!;
      newEnemyBullets.push({ id: nextId++, x: shooter.x, y: 1, fromPlayer: false });
    }
    bullets = [...bullets, ...newEnemyBullets];

    // Check player bullet hits enemies
    let updatedEnemies = [...enemies];
    let score = state.score;
    const hitEnemyIds = new Set<number>();
    const hitBulletIds = new Set<number>();

    for (const b of bullets) {
      if (!b.fromPlayer) continue;
      for (const e of updatedEnemies) {
        if (e.x === b.x && b.y <= 1 && !hitEnemyIds.has(e.id)) {
          hitEnemyIds.add(e.id);
          hitBulletIds.add(b.id);
          updatedEnemies = updatedEnemies.map(en =>
            en.id === e.id ? { ...en, hp: en.hp - 1 } : en
          );
        }
      }
    }
    const deadEnemies = updatedEnemies.filter(e => e.hp <= 0);
    score += deadEnemies.length * 10;
    updatedEnemies = updatedEnemies.filter(e => e.hp > 0);
    bullets = bullets.filter(b => !hitBulletIds.has(b.id));

    // Check enemy bullets hit player
    let playerHp = state.playerHp;
    let shieldActive = state.shieldActive;
    for (const b of bullets) {
      if (b.fromPlayer) continue;
      if (b.x === state.playerX && b.y >= ROWS - 1) {
        if (shieldActive) {
          shieldActive = false;
        } else {
          playerHp--;
        }
        hitBulletIds.add(b.id);
      }
    }
    bullets = bullets.filter(b => !hitBulletIds.has(b.id));

    // Shield cooldown
    const shieldCooldown = Math.max(0, state.shieldCooldown - 1);
    const activeShield = shieldCooldown > 0 ? shieldActive : false;

    // Spawn enemy
    let spawnedEnemies = updatedEnemies;
    if (tick % params.spawnRate === 0) {
      const col = Math.floor(rng() * COLS);
      const wave = state.wave;
      const newEnemy: SpaceShip = {
        id: nextId++,
        x: col,
        hp: params.enemyHp + Math.floor(wave / 3),
        maxHp: params.enemyHp + Math.floor(wave / 3),
      };
      spawnedEnemies = [...spawnedEnemies, newEnemy];
    }

    // Wave advancement every 30 ticks
    const wave = tick % 30 === 0 ? state.wave + 1 : state.wave;

    const gameOver = playerHp <= 0;

    return {
      ...state,
      tick,
      rngSeed: state.rngSeed,
      playerHp: Math.max(0, playerHp),
      enemies: spawnedEnemies,
      bullets,
      nextId,
      score,
      wave,
      gameOver,
      shieldActive: activeShield,
      shieldCooldown,
    };
  }

  return state;
}

export function isTerminal(state: SpaceArenaState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, Math.floor(state.score / 3)) };
}

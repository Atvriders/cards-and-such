import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TankSettings {
  gridSize: "10" | "14" | "18";
}

export type CellType = "empty" | "wall" | "player" | "enemy" | "bullet" | "enemyBullet";

export interface Position {
  x: number;
  y: number;
}

export interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  fromPlayer: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  dx: number;
  dy: number;
  shootTimer: number;
}

export interface TankState {
  settings: TankSettings;
  gridSize: number;
  player: Position;
  playerDir: { dx: number; dy: number };
  enemies: Enemy[];
  bullets: Bullet[];
  walls: boolean[][];
  score: number;
  lives: number;
  over: boolean;
  ticks: number;
  rngSeed: number;
}

export type TankAction =
  | { type: "tick" }
  | { type: "move"; dx: number; dy: number }
  | { type: "shoot" };

function generateWalls(gridSize: number, seed: number): { walls: boolean[][]; nextSeed: number } {
  const walls: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const rng = mulberry32(seed);
  let nextSeed = seed;
  // Border walls
  for (let i = 0; i < gridSize; i++) {
    walls[0]![i] = true;
    walls[gridSize - 1]![i] = true;
    walls[i]![0] = true;
    walls[i]![gridSize - 1] = true;
  }
  // Random inner walls
  for (let i = 0; i < Math.floor(gridSize * 1.5); i++) {
    const val = rng();
    nextSeed = Math.floor(val * 2 ** 31);
    const rx = Math.floor(rng() * (gridSize - 2)) + 1;
    const ry = Math.floor(rng() * (gridSize - 2)) + 1;
    // Keep center clear for player spawn
    const mid = Math.floor(gridSize / 2);
    if (Math.abs(rx - mid) > 1 || Math.abs(ry - mid) > 1) {
      walls[ry]![rx] = true;
    }
  }
  return { walls, nextSeed };
}

function spawnEnemies(gridSize: number, walls: boolean[][], count: number, seed: number): { enemies: Enemy[]; nextSeed: number } {
  const rng = mulberry32(seed);
  let nextSeed = seed;
  const enemies: Enemy[] = [];
  const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
  let attempts = 0;
  while (enemies.length < count && attempts < 1000) {
    attempts++;
    const x = Math.floor(rng() * (gridSize - 2)) + 1;
    const y = Math.floor(rng() * (gridSize - 2)) + 1;
    nextSeed = Math.floor(rng() * 2 ** 31);
    if (walls[y]?.[x]) continue;
    // Keep away from center
    const mid = Math.floor(gridSize / 2);
    if (Math.abs(x - mid) <= 2 && Math.abs(y - mid) <= 2) continue;
    const dir = dirs[Math.floor(rng() * 4)] ?? dirs[0]!;
    enemies.push({ x, y, dx: dir.dx, dy: dir.dy, shootTimer: Math.floor(rng() * 8) + 4 });
  }
  return { enemies, nextSeed };
}

export function initialState(seed: number, settings: TankSettings): TankState {
  const gridSize = parseInt(settings.gridSize, 10);
  const { walls, nextSeed } = generateWalls(gridSize, seed);
  const mid = Math.floor(gridSize / 2);
  const enemyCount = gridSize === 10 ? 2 : gridSize === 14 ? 3 : 5;
  const { enemies, nextSeed: seed2 } = spawnEnemies(gridSize, walls, enemyCount, nextSeed);
  return {
    settings,
    gridSize,
    player: { x: mid, y: mid },
    playerDir: { dx: 1, dy: 0 },
    enemies,
    bullets: [],
    walls,
    score: 0,
    lives: 3,
    over: false,
    ticks: 0,
    rngSeed: seed2,
  };
}

export function reducer(state: TankState, action: TankAction): TankState {
  if (state.over) return state;

  switch (action.type) {
    case "move": {
      const nx = state.player.x + action.dx;
      const ny = state.player.y + action.dy;
      if (state.walls[ny]?.[nx]) return { ...state, playerDir: { dx: action.dx, dy: action.dy } };
      return {
        ...state,
        player: { x: nx, y: ny },
        playerDir: { dx: action.dx, dy: action.dy },
      };
    }

    case "shoot": {
      const bullet: Bullet = {
        x: state.player.x,
        y: state.player.y,
        dx: state.playerDir.dx,
        dy: state.playerDir.dy,
        fromPlayer: true,
      };
      return { ...state, bullets: [...state.bullets, bullet] };
    }

    case "tick": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);

      // Move bullets
      let bullets: Bullet[] = state.bullets
        .map((b) => ({ ...b, x: b.x + b.dx, y: b.y + b.dy }))
        .filter((b) => {
          if (b.x < 0 || b.y < 0 || b.x >= state.gridSize || b.y >= state.gridSize) return false;
          if (state.walls[b.y]?.[b.x]) return false;
          return true;
        });

      // Check bullet vs enemies
      let enemies = [...state.enemies];
      let score = state.score;
      const survivingBullets: Bullet[] = [];
      for (const b of bullets) {
        if (!b.fromPlayer) { survivingBullets.push(b); continue; }
        let hit = false;
        enemies = enemies.filter((e) => {
          if (e.x === b.x && e.y === b.y) { hit = true; score += 100; return false; }
          return true;
        });
        if (!hit) survivingBullets.push(b);
      }
      bullets = survivingBullets;

      // Check enemy bullets vs player
      let lives = state.lives;
      let playerX = state.player.x;
      let playerY = state.player.y;
      const survivingEnemyBullets: Bullet[] = [];
      for (const b of bullets) {
        if (b.fromPlayer) { survivingEnemyBullets.push(b); continue; }
        if (b.x === playerX && b.y === playerY) {
          lives -= 1;
        } else {
          survivingEnemyBullets.push(b);
        }
      }
      bullets = [...survivingEnemyBullets.filter((b) => !b.fromPlayer), ...survivingEnemyBullets.filter((b) => b.fromPlayer)];
      // Fix: rebuild properly
      bullets = [
        ...bullets.filter((b) => b.fromPlayer),
        ...bullets.filter((b) => !b.fromPlayer && !(b.x === playerX && b.y === playerY)),
      ];

      // Move enemies (simple bounce)
      const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
      const newEnemies: Enemy[] = enemies.map((e, i) => {
        const nx = e.x + e.dx;
        const ny = e.y + e.dy;
        let dx = e.dx;
        let dy = e.dy;
        if (state.walls[ny]?.[nx]) {
          const d = dirs[Math.floor(rng() * 4)] ?? dirs[0]!;
          dx = d.dx;
          dy = d.dy;
        }
        const newX = state.walls[e.y + dy]?.[e.x + dx] ? e.x : e.x + dx;
        const newY = state.walls[e.y + dy]?.[e.x + dx] ? e.y : e.y + dy;
        const shootTimer = e.shootTimer - 1;
        let newBullets = bullets;
        if (shootTimer <= 0) {
          newBullets = [...bullets, { x: e.x, y: e.y, dx: e.dx, dy: e.dy, fromPlayer: false }];
          bullets = newBullets;
        }
        return {
          x: newX, y: newY, dx, dy,
          shootTimer: shootTimer <= 0 ? (Math.floor(rng() * 8) + 4) : shootTimer,
        };
      });

      // Re-check enemy bullets vs player after enemy shoot
      const finalBullets: Bullet[] = [];
      for (const b of bullets) {
        if (!b.fromPlayer && b.x === playerX && b.y === playerY) {
          lives -= 1;
        } else {
          finalBullets.push(b);
        }
      }

      const over = lives <= 0 || newEnemies.length === 0;
      if (newEnemies.length === 0) score += 500;

      return {
        ...state,
        enemies: newEnemies,
        bullets: finalBullets,
        player: { x: playerX, y: playerY },
        score,
        lives: Math.max(0, lives),
        over,
        ticks: state.ticks + 1,
        rngSeed: nextSeed,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TankState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

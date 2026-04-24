import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_COLS = 8;
export const GRID_ROWS = 6;
export const TOTAL_WAVES = 10;
export const BASE_HP = 20;

export type TowerType = "arrow" | "cannon" | "slow" | "lightning";
export type CellContent = "path" | "grass" | TowerType | "base";

// Path indices (left to right snake path)
export const PATH: number[] = [
  0, 1, 2, 3, 4, 5, 6, 7,           // row 0 left→right
  15, 23, 31,                          // col 7, rows 1-3
  30, 29, 28, 27, 26, 25, 24,         // row 3 right→left (without 31)
  16, 8,                               // col 0, rows 2-1
  9, 10, 11, 12, 13, 14,              // row 1 left→right (without 8)
  22,                                  // col 6 row 2
  21, 20, 19, 18, 17,                 // row 2 right→left (without 22)
  33, 41,                              // col 1 rows 4-5
  42, 43, 44, 45, 46, 47,            // row 5 cols 2-7
];

export interface Enemy {
  id: number;
  pathIndex: number; // current position on path
  hp: number;
  maxHp: number;
  speed: number; // steps per wave advance
  slowed: boolean;
}

export interface Tower {
  type: TowerType;
  damage: number;
  range: number;
  cooldown: number; // turns between shots
  cooldownLeft: number;
}

export const TOWER_DEFS: Record<TowerType, Tower & { cost: number; label: string }> = {
  arrow:     { type: "arrow",     damage: 10, range: 2, cooldown: 1, cooldownLeft: 0, cost: 30,  label: "Arrow" },
  cannon:    { type: "cannon",    damage: 25, range: 2, cooldown: 2, cooldownLeft: 0, cost: 60,  label: "Cannon" },
  slow:      { type: "slow",      damage: 5,  range: 2, cooldown: 1, cooldownLeft: 0, cost: 40,  label: "Slow" },
  lightning: { type: "lightning", damage: 40, range: 3, cooldown: 3, cooldownLeft: 0, cost: 100, label: "Lightning" },
};

export interface TowerDefenseMiniState {
  rngSeed: number;
  wave: number;
  gold: number;
  baseHp: number;
  grid: readonly CellContent[];
  towers: readonly (Tower | null)[];
  enemies: readonly Enemy[];
  phase: "build" | "wave" | "done" | "lost";
  log: readonly string[];
}

export type TowerDefenseMiniAction =
  | { type: "placeTower"; cellIndex: number; towerType: TowerType }
  | { type: "startWave" }
  | { type: "sellTower"; cellIndex: number };

let enemyIdCounter = 0;

function buildInitialGrid(): CellContent[] {
  const grid: CellContent[] = Array(GRID_COLS * GRID_ROWS).fill("grass");
  for (const p of PATH) {
    if (p < grid.length) grid[p] = "path";
  }
  if (PATH.length > 0) grid[PATH[PATH.length - 1]!] = "base";
  return grid;
}

function spawnEnemies(wave: number, rng: () => number): Enemy[] {
  const count = 3 + wave * 2;
  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    const hp = 15 + wave * 10 + Math.floor(rng() * 10);
    enemies.push({
      id: enemyIdCounter++,
      pathIndex: -i * 2, // staggered start
      hp,
      maxHp: hp,
      speed: 1,
      slowed: false,
    });
  }
  return enemies;
}

function cellDist(a: number, b: number): number {
  const ar = Math.floor(a / GRID_COLS), ac = a % GRID_COLS;
  const br = Math.floor(b / GRID_COLS), bc = b % GRID_COLS;
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

function runWave(
  towers: readonly (Tower | null)[],
  enemies: readonly Enemy[],
  baseHp: number,
  rng: () => number
): { towers: Tower[]; enemies: Enemy[]; baseHp: number; log: string[] } {
  const tArr = towers.map(t => t ? { ...t } : null);
  let eArr: Enemy[] = enemies.map(e => ({ ...e }));
  let hp = baseHp;
  const log: string[] = [];

  // Simulate up to 30 ticks
  for (let tick = 0; tick < 30 && eArr.some(e => e.hp > 0 && e.pathIndex < PATH.length); tick++) {
    // Move enemies
    eArr = eArr.map(e => {
      if (e.hp <= 0) return e;
      const steps = e.slowed ? 1 : e.speed;
      return { ...e, pathIndex: e.pathIndex + steps, slowed: false };
    });

    // Check for enemies reaching base
    for (const e of eArr) {
      if (e.hp > 0 && e.pathIndex >= PATH.length) {
        hp = Math.max(0, hp - 2);
        e.hp = 0;
      }
    }

    // Towers shoot
    for (let ci = 0; ci < tArr.length; ci++) {
      const tower = tArr[ci];
      if (!tower || tower.cooldownLeft > 0) {
        if (tower) tower.cooldownLeft = Math.max(0, tower.cooldownLeft - 1);
        continue;
      }
      // Find nearest enemy in range
      const inRange = eArr.filter(e => {
        if (e.hp <= 0 || e.pathIndex < 0 || e.pathIndex >= PATH.length) return false;
        const ep = PATH[e.pathIndex] ?? 0;
        return cellDist(ci, ep) <= tower.range;
      });
      if (inRange.length === 0) continue;

      // Target enemy furthest along path
      inRange.sort((a, b) => b.pathIndex - a.pathIndex);
      const target = inRange[0]!;
      const noise = 1 + (rng() * 0.2 - 0.1);
      const dmg = Math.round(tower.damage * noise);
      target.hp = Math.max(0, target.hp - dmg);
      if (tower.type === "slow") target.slowed = true;
      tower.cooldownLeft = tower.cooldown;
    }
  }

  return {
    towers: tArr as Tower[],
    enemies: eArr,
    baseHp: hp,
    log,
  };
}

export function initialState(seed: number): TowerDefenseMiniState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const grid = buildInitialGrid();
  return {
    rngSeed: nextSeed,
    wave: 0,
    gold: 150,
    baseHp: BASE_HP,
    grid,
    towers: Array(GRID_COLS * GRID_ROWS).fill(null),
    enemies: [],
    phase: "build",
    log: [],
  };
}

export function reducer(state: TowerDefenseMiniState, action: TowerDefenseMiniAction): TowerDefenseMiniState {
  if (state.phase === "done" || state.phase === "lost") return state;

  switch (action.type) {
    case "placeTower": {
      if (state.phase !== "build") return state;
      const { cellIndex, towerType } = action;
      if (cellIndex < 0 || cellIndex >= state.grid.length) return state;
      if (state.grid[cellIndex] !== "grass") return state;
      if (state.towers[cellIndex] !== null) return state;
      const def = TOWER_DEFS[towerType];
      if (state.gold < def.cost) return state;
      const newTowers = [...state.towers];
      newTowers[cellIndex] = { type: def.type, damage: def.damage, range: def.range, cooldown: def.cooldown, cooldownLeft: 0 };
      const newGrid = [...state.grid];
      newGrid[cellIndex] = towerType;
      return {
        ...state,
        gold: state.gold - def.cost,
        towers: newTowers,
        grid: newGrid,
      };
    }

    case "sellTower": {
      if (state.phase !== "build") return state;
      const { cellIndex } = action;
      if (!state.towers[cellIndex]) return state;
      const tower = state.towers[cellIndex]!;
      const def = TOWER_DEFS[tower.type];
      const newTowers = [...state.towers];
      newTowers[cellIndex] = null;
      const newGrid = [...state.grid];
      newGrid[cellIndex] = "grass";
      return {
        ...state,
        gold: state.gold + Math.floor(def.cost * 0.5),
        towers: newTowers,
        grid: newGrid,
      };
    }

    case "startWave": {
      if (state.phase !== "build") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const nextWave = state.wave + 1;
      const enemies = spawnEnemies(nextWave, rng2);
      const { towers, enemies: survivingEnemies, baseHp, log } = runWave(
        state.towers, enemies, state.baseHp, rng2
      );

      const killed = enemies.length - survivingEnemies.filter(e => e.hp > 0).length;
      const goldEarned = killed * 8 + 20;
      const waveLog = `Wave ${nextWave}: ${killed}/${enemies.length} enemies killed, +${goldEarned} gold`;

      if (baseHp <= 0) {
        return {
          ...state,
          rngSeed: nextSeed,
          wave: nextWave,
          baseHp: 0,
          gold: state.gold + goldEarned,
          towers,
          enemies: survivingEnemies,
          phase: "lost",
          log: [...state.log, waveLog, ...log],
        };
      }

      if (nextWave >= TOTAL_WAVES) {
        return {
          ...state,
          rngSeed: nextSeed,
          wave: nextWave,
          baseHp,
          gold: state.gold + goldEarned,
          towers,
          enemies: survivingEnemies,
          phase: "done",
          log: [...state.log, waveLog, ...log],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        wave: nextWave,
        baseHp,
        gold: state.gold + goldEarned,
        towers,
        enemies: survivingEnemies,
        phase: "build",
        log: [...state.log, waveLog, ...log],
      };
    }
  }
}

export function isTerminal(state: TowerDefenseMiniState): { score: number } | null {
  if (state.phase === "done") {
    return { score: Math.max(0, Math.min(100, Math.round(((state.baseHp / BASE_HP) * 50) + (state.wave / TOTAL_WAVES) * 50))) };
  }
  if (state.phase === "lost") {
    return { score: Math.max(0, Math.round((state.wave / TOTAL_WAVES) * 60)) };
  }
  return null;
}

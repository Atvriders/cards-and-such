import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SwarmDefenseSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Enemy {
  id: number;
  x: number; // 0..9 column
  y: number; // 0..8 row (0=top spawns, 8=base)
  hp: number;
}

export interface SwarmDefenseState {
  settings: SwarmDefenseSettings;
  rngSeed: number;
  wave: number;
  tick: number;
  enemies: Enemy[];
  nextId: number;
  baseHp: number;
  gold: number;
  towerCol: number | null; // selected column for tower
  towers: number[];        // columns with towers (0..9)
  towerDamage: number;
  score: number;
  gameOver: boolean;
}

export type SwarmDefenseAction =
  | { type: "tick" }
  | { type: "selectCol"; col: number }
  | { type: "buildTower" }
  | { type: "restart" };

const COLS = 10;
const ROWS = 9;
const BASE_ROW = 8;
const TOWER_COST = 5;

function difficultyParams(d: SwarmDefenseSettings["difficulty"]) {
  if (d === "easy") return { spawnInterval: 4, maxWave: 5, enemyHp: 1 };
  if (d === "hard") return { spawnInterval: 2, maxWave: 10, enemyHp: 3 };
  return { spawnInterval: 3, maxWave: 7, enemyHp: 2 };
}

export function initialState(seed: number, settings: SwarmDefenseSettings): SwarmDefenseState {
  return {
    settings,
    rngSeed: seed,
    wave: 1,
    tick: 0,
    enemies: [],
    nextId: 0,
    baseHp: 10,
    gold: 15,
    towerCol: null,
    towers: [],
    towerDamage: 1,
    score: 0,
    gameOver: false,
  };
}

function spawnEnemy(state: SwarmDefenseState, rng: () => number): Enemy {
  const col = Math.floor(rng() * COLS);
  const { enemyHp } = difficultyParams(state.settings.difficulty);
  return { id: state.nextId, x: col, y: 0, hp: enemyHp + Math.floor(state.wave / 3) };
}

export function reducer(state: SwarmDefenseState, action: SwarmDefenseAction): SwarmDefenseState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "selectCol") {
    return { ...state, towerCol: action.col };
  }

  if (action.type === "buildTower") {
    const { towerCol } = state;
    if (towerCol === null) return state;
    if (state.gold < TOWER_COST) return state;
    if (state.towers.includes(towerCol)) return state;
    return {
      ...state,
      towers: [...state.towers, towerCol],
      gold: state.gold - TOWER_COST,
      towerCol: null,
    };
  }

  if (action.type === "tick") {
    const { spawnInterval, maxWave } = difficultyParams(state.settings.difficulty);
    const tick = state.tick + 1;
    const rng = mulberry32(state.rngSeed + tick);

    // Move enemies down one row
    let enemies = state.enemies.map(e => ({ ...e, y: e.y + 1 }));

    // Towers fire: each enemy in a tower's column takes damage
    let score = state.score;
    enemies = enemies.map(e => {
      if (state.towers.includes(e.x)) {
        const newHp = e.hp - state.towerDamage;
        if (newHp <= 0) { score += 10; return { ...e, hp: 0 }; }
        return { ...e, hp: newHp };
      }
      return e;
    }).filter(e => e.hp > 0);

    // Enemies that reached the base
    const reachedBase = enemies.filter(e => e.y >= BASE_ROW);
    const baseHp = state.baseHp - reachedBase.length;
    enemies = enemies.filter(e => e.y < BASE_ROW);

    // Gold for surviving
    const gold = state.gold + 1;

    // Spawn new enemy?
    let { nextId, wave } = state;
    if (tick % spawnInterval === 0) {
      const count = Math.ceil(wave / 2);
      for (let i = 0; i < count; i++) {
        enemies = [...enemies, spawnEnemy({ ...state, nextId, wave }, rng)];
        nextId++;
      }
    }

    // Wave advancement
    if (tick % (spawnInterval * 8) === 0 && wave < maxWave) {
      wave++;
    }

    const gameOver = baseHp <= 0;

    return {
      ...state,
      tick,
      enemies,
      nextId,
      wave,
      baseHp: Math.max(0, baseHp),
      gold,
      score,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: SwarmDefenseState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, Math.floor(state.score / 5)) };
}

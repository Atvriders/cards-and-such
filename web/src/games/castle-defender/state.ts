import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CastleSettings {
  waves: "3" | "5" | "7";
}

export interface Enemy {
  id: number;
  x: number; // 0..1 (0 = spawn right, 1 = castle wall)
  hp: number;
  maxHp: number;
  speed: number;
}

export interface Arrow {
  id: number;
  progress: number; // 0..1 (1 = hit)
  targetId: number;
}

export interface CastleState {
  settings: CastleSettings;
  castleHP: number;
  maxCastleHP: number;
  enemies: Enemy[];
  arrows: Arrow[];
  wave: number;
  maxWaves: number;
  gold: number;
  archerCount: number;
  score: number;
  over: boolean;
  victory: boolean;
  ticks: number;
  nextSpawnIn: number;
  enemiesThisWave: number;
  enemiesSpawned: number;
  rngSeed: number;
  nextId: number;
}

export type CastleAction =
  | { type: "tick" }
  | { type: "buyArcher" }
  | { type: "nextWave" };

export function initialState(seed: number, settings: CastleSettings): CastleState {
  const rng = mulberry32(seed);
  return {
    settings,
    castleHP: 100,
    maxCastleHP: 100,
    enemies: [],
    arrows: [],
    wave: 1,
    maxWaves: parseInt(settings.waves, 10),
    gold: 50,
    archerCount: 1,
    score: 0,
    over: false,
    victory: false,
    ticks: 0,
    nextSpawnIn: 20,
    enemiesThisWave: 5,
    enemiesSpawned: 0,
    rngSeed: Math.floor(rng() * 2 ** 31),
    nextId: 1,
  };
}

export function reducer(state: CastleState, action: CastleAction): CastleState {
  if (state.over) return state;

  switch (action.type) {
    case "buyArcher": {
      const cost = 30 + state.archerCount * 20;
      if (state.gold < cost) return state;
      return { ...state, gold: state.gold - cost, archerCount: state.archerCount + 1 };
    }

    case "nextWave": {
      if (state.enemiesSpawned < state.enemiesThisWave) return state;
      if (state.enemies.length > 0) return state;
      if (state.wave >= state.maxWaves) return state;
      const nextWave = state.wave + 1;
      return {
        ...state,
        wave: nextWave,
        enemiesThisWave: 5 + nextWave * 2,
        enemiesSpawned: 0,
        nextSpawnIn: 15,
        gold: state.gold + 20,
      };
    }

    case "tick": {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);

      // Spawn enemy
      let { enemies, nextSpawnIn, enemiesSpawned, nextId } = state;
      if (enemiesSpawned < state.enemiesThisWave && nextSpawnIn <= 0) {
        const hp = 20 + state.wave * 10 + Math.floor(rng() * 10);
        enemies = [...enemies, {
          id: nextId,
          x: 0,
          hp,
          maxHp: hp,
          speed: 0.004 + rng() * 0.003,
        }];
        nextId++;
        enemiesSpawned++;
        nextSpawnIn = Math.floor(rng() * 10) + 8;
      } else {
        nextSpawnIn = Math.max(0, nextSpawnIn - 1);
      }

      // Move enemies
      const reachedCastle: number[] = [];
      enemies = enemies.map((e) => {
        const nx = e.x + e.speed;
        if (nx >= 1) { reachedCastle.push(e.id); return e; }
        return { ...e, x: nx };
      }).filter((e) => !reachedCastle.includes(e.id));

      let castleHP = state.castleHP - reachedCastle.length * 15;

      // Fire arrows from archers — each archer targets nearest enemy
      let arrows = state.arrows.map((a) => ({ ...a, progress: a.progress + 0.12 }));

      // Spawn new arrows for archers
      const targeted = new Set(arrows.map((a) => a.targetId));
      const sortedEnemies = [...enemies].sort((a, b) => b.x - a.x);
      for (let i = 0; i < state.archerCount; i++) {
        const target = sortedEnemies[i % sortedEnemies.length];
        if (target && !targeted.has(target.id)) {
          arrows = [...arrows, { id: nextId++, progress: 0, targetId: target.id }];
          targeted.add(target.id);
        }
      }

      // Resolve arrow hits
      const hitEnemies = new Set<number>();
      arrows = arrows.filter((a) => {
        if (a.progress >= 1) {
          hitEnemies.add(a.targetId);
          return false;
        }
        return true;
      });

      let score = state.score;
      let gold = state.gold;
      enemies = enemies.map((e) => {
        if (hitEnemies.has(e.id)) {
          const dmg = 10 + state.archerCount * 2;
          return { ...e, hp: e.hp - dmg };
        }
        return e;
      }).filter((e) => {
        if (e.hp <= 0) { score += 10; gold += 5; return false; }
        return true;
      });

      const allDone = enemiesSpawned >= state.enemiesThisWave && enemies.length === 0;
      const waveComplete = allDone && state.wave >= state.maxWaves;
      const over = castleHP <= 0 || waveComplete;
      const victory = waveComplete && castleHP > 0;

      return {
        ...state,
        castleHP: Math.max(0, castleHP),
        enemies,
        arrows,
        gold,
        score: score + (victory ? 200 : 0),
        over,
        victory,
        ticks: state.ticks + 1,
        nextSpawnIn,
        enemiesSpawned,
        rngSeed: nextSeed,
        nextId,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CastleState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
